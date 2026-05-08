import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smsBlacklist.deleteMany({ where: { id } });
  return ok({ deleted: true });
}
