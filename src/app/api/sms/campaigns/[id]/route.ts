import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const campaign = await prisma.smsCampaign.findFirst({
    where: { id, userId: auth.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });
  if (!campaign) return fail("Kampanya bulunamadi.", 404);
  return ok(campaign);
}
