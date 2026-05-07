import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smsPhoneBook.deleteMany({
    where: { id, userId: auth.user.id },
  });
  return ok({ deleted: true });
}
