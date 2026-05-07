import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const exists = await prisma.smsCampaign.findUnique({ where: { id } });
  if (!exists) return fail("Kampanya bulunamadi.", 404);
  const updated = await prisma.smsCampaign.update({
    where: { id },
    data: { status: "canceled", completedAt: new Date() },
  });
  await writeAuditLog({
    userId: auth.user.id,
    action: "CAMPAIGN_CANCEL",
    entityType: "SmsCampaign",
    entityId: id,
  });
  return ok(updated);
}
