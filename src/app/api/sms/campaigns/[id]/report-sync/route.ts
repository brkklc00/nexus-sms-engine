import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { enqueueReportSync } from "@/modules/sms/campaign.service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const campaign = await prisma.smsCampaign.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!campaign) return fail("Kampanya bulunamadi.", 404);
  if (!campaign.providerReportId) return fail("Saglayici rapor id bulunamadi.", 422);

  await enqueueReportSync(campaign.id, campaign.providerId, campaign.providerReportId);
  return ok({ queued: true });
}
