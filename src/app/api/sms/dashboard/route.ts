import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/http";
import { requireApiUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [messagesToday, campaignsActive, provider, recent] = await Promise.all([
    prisma.smsMessage.aggregate({
      where: { userId: auth.user.id, createdAt: { gte: today } },
      _count: { _all: true },
      _sum: { cost: true },
    }),
    prisma.smsCampaign.count({
      where: { userId: auth.user.id, status: { in: ["queued", "running"] } },
    }),
    prisma.smsProvider.findFirst({ where: { isActive: true }, orderBy: { priority: "asc" } }),
    prisma.auditLog.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return ok({
    totalSentToday: messagesToday._count._all,
    creditsUsedToday: Number(messagesToday._sum.cost ?? 0),
    activeCampaigns: campaignsActive,
    providerBalanceAvailable: Boolean(provider),
    recentActivity: recent,
  });
}
