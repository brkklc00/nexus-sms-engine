import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({
  scope: z.enum(["all_active", "selected", "healthy", "error"]),
  smtpAccountIds: z.array(z.string()).optional(),
  includeAuthErrors: z.boolean().default(false),
  setHealthy: z.boolean().default(false),
});

function whereByScope(scope: "all_active" | "selected" | "healthy" | "error", smtpAccountIds?: string[]) {
  if (scope === "selected") return { id: { in: smtpAccountIds?.length ? smtpAccountIds : ["_none_"] } };
  if (scope === "healthy") return { healthStatus: "healthy" };
  if (scope === "error") return { healthStatus: "error" };
  return { isActive: true };
}

const authErrorRegex = /(auth|401|403|invalid credential|unauthorized|password|kimlik)/i;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return fail("Geçersiz istek gövdesi.", 422);

  const targets = await prisma.smsProvider.findMany({
    where: { ...whereByScope(parsed.data.scope, parsed.data.smtpAccountIds), deletedAt: null },
    select: { id: true, lastError: true },
  });
  if (!targets.length) return fail("İşlenecek SMTP hesabı bulunamadı.", 404);

  const allowedIds = targets
    .filter((item) => parsed.data.includeAuthErrors || !authErrorRegex.test(item.lastError ?? ""))
    .map((item) => item.id);
  if (!allowedIds.length) {
    return ok({ updated: 0, skipped: targets.length });
  }

  const result = await prisma.smsProvider.updateMany({
    where: { id: { in: allowedIds }, deletedAt: null },
    data: {
      isThrottled: false,
      throttleReason: null,
      cooldownUntil: null,
      lastError: null,
      ...(parsed.data.setHealthy ? { healthStatus: "healthy" } : {}),
    },
  });

  await writeAuditLog({
    userId: auth.user.id,
    action: "SMTP_RESET_THROTTLE",
    entityType: "SmsProvider",
    metadata: {
      scope: parsed.data.scope,
      includeAuthErrors: parsed.data.includeAuthErrors,
      setHealthy: parsed.data.setHealthy,
      updated: result.count,
      skipped: Math.max(0, targets.length - result.count),
    },
  });

  return ok({
    updated: result.count,
    skipped: Math.max(0, targets.length - result.count),
  });
}
