import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smsBlacklist.deleteMany({
    where: { id, OR: [{ userId: auth.user.id }, { userId: null }] },
  });
  return ok({ deleted: true });
}
