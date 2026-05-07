import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { encryptSecret } from "@/lib/crypto";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).optional(),
  baseUrl: z.string().url().optional(),
  token: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
  timeoutSeconds: z.number().int().optional(),
  dailyLimit: z.number().int().nullable().optional(),
  hourlyLimit: z.number().int().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  const provider = await prisma.smsProvider.update({
    where: { id },
    data: {
      ...parsed.data,
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
