import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const campaign = await prisma.smsCampaign.findUnique({
    where: { id },
    include: { user: true, provider: true, messages: true },
  });
  if (!campaign) return fail("Kampanya bulunamadi.", 404);
  return ok(campaign);
}
