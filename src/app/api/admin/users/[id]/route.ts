import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["admin", "customer"]).optional(),
  isActive: z.boolean().optional(),
  smsMarkupPercent: z.number().min(0).max(500).optional(),
  defaultProviderId: z.string().nullable().optional(),
  resetPassword: z.string().min(6).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.resetPassword
        ? { passwordHash: await hashPassword(parsed.data.resetPassword) }
        : {}),
    },
  });
  await writeAuditLog({
    userId: auth.user.id,
    action: "USER_UPDATE",
    entityType: "User",
    entityId: user.id,
    metadata: parsed.data,
  });
  return ok(user);
}
