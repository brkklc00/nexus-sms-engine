import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifre tekrarı eşleşmiyor.",
    path: ["passwordConfirm"],
  });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(parsed.data.password) },
      select: { id: true, email: true },
    });
    await prisma.session.deleteMany({ where: { userId: id } });
    await writeAuditLog({
      userId: auth.user.id,
      action: "USER_RESET_PASSWORD",
      entityType: "User",
      entityId: id,
      metadata: { email: user.email },
    });
    return ok({ updated: true });
  } catch {
    return fail("Şifre güncellenemedi.", 500);
  }
}
