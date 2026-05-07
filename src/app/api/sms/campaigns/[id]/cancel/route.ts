import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const campaign = await prisma.smsCampaign.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!campaign) return fail("Kampanya bulunamadi.", 404);

  const updated = await prisma.smsCampaign.update({
    where: { id },
    data: { status: "canceled", completedAt: new Date() },
  });
  return ok(updated);
}
