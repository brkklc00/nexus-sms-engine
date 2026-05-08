import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { encryptSecret } from "@/lib/crypto";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  baseUrl: z.string().url().optional(),
  token: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
  timeoutSeconds: z.number().int().optional(),
  dailyLimit: z.number().int().nullable().optional(),
  hourlyLimit: z.number().int().nullable().optional(),
  targetRatePerSecond: z.number().positive().optional(),
  maxRatePerSecond: z.number().positive().optional(),
  warmupEnabled: z.boolean().optional(),
  warmupStartRps: z.number().positive().optional(),
  warmupIncrementStep: z.number().positive().optional(),
  warmupMaxRps: z.number().positive().optional(),
  dailyCap: z.number().int().positive().nullable().optional(),
  hourlyCap: z.number().int().positive().nullable().optional(),
  minuteCap: z.number().int().positive().nullable().optional(),
  isThrottled: z.boolean().optional(),
  throttleReason: z.string().nullable().optional(),
  cooldownUntil: z.string().datetime().nullable().optional(),
  lastError: z.string().nullable().optional(),
  healthStatus: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  const provider = await prisma.smsProvider.update({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      baseUrl: true,
      isActive: true,
      priority: true,
      timeoutSeconds: true,
      dailyLimit: true,
      hourlyLimit: true,
      targetRatePerSecond: true,
      maxRatePerSecond: true,
      warmupEnabled: true,
      warmupStartRps: true,
      warmupIncrementStep: true,
      warmupMaxRps: true,
      dailyCap: true,
      hourlyCap: true,
      minuteCap: true,
      isThrottled: true,
      throttleReason: true,
      cooldownUntil: true,
      lastError: true,
      healthStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    data: {
      ...parsed.data,
      ...(parsed.data.cooldownUntil !== undefined
        ? { cooldownUntil: parsed.data.cooldownUntil ? new Date(parsed.data.cooldownUntil) : null }
        : {}),
      ...(parsed.data.token ? { tokenEncrypted: encryptSecret(parsed.data.token) } : {}),
    },
  });
  await writeAuditLog({
    userId: auth.user.id,
    action: "PROVIDER_UPDATE",
    entityType: "SmsProvider",
    entityId: provider.id,
    metadata: {
      ...parsed.data,
      token: parsed.data.token ? "***" : undefined,
    },
  });
  return ok(provider);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  return PATCH(req, context);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smsProvider.updateMany({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await writeAuditLog({
    userId: auth.user.id,
    action: "PROVIDER_DELETE",
    entityType: "SmsProvider",
    entityId: id,
  });
  return ok({ deleted: true });
}
