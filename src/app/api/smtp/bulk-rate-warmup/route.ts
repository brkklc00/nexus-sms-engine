import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const scopeSchema = z.enum(["all_active", "selected", "healthy", "error"]);
const presetSchema = z.enum(["safe", "balanced", "fast", "aggressive", "custom", "daily_target"]);

const bodySchema = z.object({
  scope: scopeSchema,
  smtpAccountIds: z.array(z.string()).optional(),
  preset: presetSchema,
  dailyTarget: z.number().int().positive().optional(),
  values: z
    .object({
      targetRatePerSecond: z.number().positive().optional(),
      maxRatePerSecond: z.number().positive().optional(),
      warmupEnabled: z.boolean().optional(),
      warmupStartRps: z.number().positive().optional(),
      warmupIncrementStep: z.number().positive().optional(),
      warmupMaxRps: z.number().positive().optional(),
      dailyCap: z.number().int().positive().nullable().optional(),
      hourlyCap: z.number().int().positive().nullable().optional(),
      minuteCap: z.number().int().positive().nullable().optional(),
      resetThrottle: z.boolean().optional(),
      clearCooldown: z.boolean().optional(),
      clearLastError: z.boolean().optional(),
      onlyActive: z.boolean().optional(),
    })
    .optional(),
});

const presetValues: Record<
  Exclude<z.infer<typeof presetSchema>, "custom" | "daily_target">,
  {
    targetRatePerSecond: number;
    maxRatePerSecond: number;
    warmupEnabled: boolean;
    warmupStartRps: number;
    warmupIncrementStep: number;
    warmupMaxRps: number;
  }
> = {
  safe: {
    targetRatePerSecond: 0.2,
    maxRatePerSecond: 0.5,
    warmupEnabled: true,
    warmupStartRps: 0.1,
    warmupIncrementStep: 0.1,
    warmupMaxRps: 1,
  },
  balanced: {
    targetRatePerSecond: 0.5,
    maxRatePerSecond: 1,
    warmupEnabled: true,
    warmupStartRps: 0.2,
    warmupIncrementStep: 0.2,
    warmupMaxRps: 2,
  },
  fast: {
    targetRatePerSecond: 1,
    maxRatePerSecond: 2,
    warmupEnabled: true,
    warmupStartRps: 0.5,
    warmupIncrementStep: 0.5,
    warmupMaxRps: 3,
  },
  aggressive: {
    targetRatePerSecond: 2,
    maxRatePerSecond: 5,
    warmupEnabled: true,
    warmupStartRps: 1,
    warmupIncrementStep: 1,
    warmupMaxRps: 5,
  },
};

function whereByScope(scope: z.infer<typeof scopeSchema>, smtpAccountIds?: string[]) {
  if (scope === "selected") {
    return { id: { in: smtpAccountIds?.length ? smtpAccountIds : ["_none_"] } };
  }
  if (scope === "healthy") return { isActive: true, healthStatus: "healthy" };
  if (scope === "error") return { healthStatus: "error" };
  return { isActive: true };
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return fail("Geçersiz istek gövdesi.", 422);

  const baseWhere = whereByScope(parsed.data.scope, parsed.data.smtpAccountIds);
  const where = {
    ...baseWhere,
    deletedAt: null,
    ...(parsed.data.values?.onlyActive ? { isActive: true } : {}),
  };

  const targets = await prisma.smsProvider.findMany({
    where,
    select: { id: true, isActive: true, healthStatus: true },
  });
  if (!targets.length) return fail("Güncellenecek SMTP hesabı bulunamadı.", 404);

  let appliedValues:
    | {
        targetRatePerSecond: number;
        maxRatePerSecond: number;
        warmupEnabled: boolean;
        warmupStartRps: number;
        warmupIncrementStep: number;
        warmupMaxRps: number;
        dailyCap?: number | null;
        hourlyCap?: number | null;
        minuteCap?: number | null;
      }
    | undefined;

  let preview: Record<string, unknown> = {
    toplamSmtp: targets.length,
    kullanilacakSmtp: targets.length,
  };

  if (parsed.data.preset === "daily_target") {
    const dailyTarget = parsed.data.dailyTarget ?? 0;
    if (!dailyTarget) return fail("Günlük hedef zorunludur.", 422);

    const usableSmtpCount = targets.filter((item) => item.isActive && item.healthStatus === "healthy").length;
    if (!usableSmtpCount) return fail("Dağıtım için aktif/sağlıklı SMTP yok.", 422);
    const globalRps = dailyTarget / 86400;
    const perSmtpRps = globalRps / usableSmtpCount;
    const perSmtpDailyCap = Math.ceil(dailyTarget / usableSmtpCount);
    const perSmtpHourlyCap = Math.ceil(perSmtpDailyCap / 24);
    const perSmtpMinuteCap = Math.ceil(perSmtpHourlyCap / 60);
    appliedValues = {
      targetRatePerSecond: perSmtpRps,
      maxRatePerSecond: perSmtpRps,
      warmupEnabled: true,
      warmupStartRps: Math.max(0.1, perSmtpRps / 2),
      warmupIncrementStep: Math.max(0.1, perSmtpRps / 4),
      warmupMaxRps: perSmtpRps,
      dailyCap: perSmtpDailyCap,
      hourlyCap: perSmtpHourlyCap,
      minuteCap: perSmtpMinuteCap,
    };
    preview = {
      toplamSmtp: targets.length,
      kullanilacakSmtp: usableSmtpCount,
      gunlukHedef: dailyTarget,
      smtpBasiGunlukLimit: perSmtpDailyCap,
      smtpBasiRps: perSmtpRps,
      tahminiToplamRps: perSmtpRps * usableSmtpCount,
    };
  } else if (parsed.data.preset === "custom") {
    const values = parsed.data.values;
    if (!values?.targetRatePerSecond || !values?.maxRatePerSecond) {
      return fail("Özel preset için target/max RPS zorunlu.", 422);
    }
    appliedValues = {
      targetRatePerSecond: values.targetRatePerSecond,
      maxRatePerSecond: values.maxRatePerSecond,
      warmupEnabled: values.warmupEnabled ?? true,
      warmupStartRps: values.warmupStartRps ?? values.targetRatePerSecond,
      warmupIncrementStep: values.warmupIncrementStep ?? 0.1,
      warmupMaxRps: values.warmupMaxRps ?? values.maxRatePerSecond,
      dailyCap: values.dailyCap,
      hourlyCap: values.hourlyCap,
      minuteCap: values.minuteCap,
    };
  } else {
    const preset = presetValues[parsed.data.preset];
    const values = parsed.data.values;
    appliedValues = {
      ...preset,
      dailyCap: values?.dailyCap,
      hourlyCap: values?.hourlyCap,
      minuteCap: values?.minuteCap,
    };
  }

  const updateData = {
    ...appliedValues,
    ...(parsed.data.values?.resetThrottle ? { isThrottled: false, throttleReason: null } : {}),
    ...(parsed.data.values?.clearCooldown ? { cooldownUntil: null } : {}),
    ...(parsed.data.values?.clearLastError ? { lastError: null } : {}),
    updatedAt: new Date(),
  };

  const result = await prisma.smsProvider.updateMany({
    where: { id: { in: targets.map((t) => t.id) }, deletedAt: null },
    data: updateData,
  });

  await writeAuditLog({
    userId: auth.user.id,
    action: "SMTP_BULK_RATE_WARMUP_UPDATE",
    entityType: "SmsProvider",
    metadata: {
      scope: parsed.data.scope,
      preset: parsed.data.preset,
      updated: result.count,
      preview,
      appliedValues,
    },
  });

  return ok({
    updated: result.count,
    skipped: Math.max(0, targets.length - result.count),
    preview,
    appliedValues,
  });
}
