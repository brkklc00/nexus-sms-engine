import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeUsers,
    totalCredits,
    todayMessages,
    monthMessages,
    success,
    failed,
    pending,
    totalCampaigns,
    activeCampaigns,
    queuedCampaigns,
    completedCampaigns,
    totalProviders,
    activeProviders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "customer", isActive: true } }),
    prisma.user.aggregate({ _sum: { smsCreditBalance: true } }),
    prisma.smsMessage.count({ where: { createdAt: { gte: today } } }),
    prisma.smsMessage.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.smsMessage.count({ where: { status: "delivered" } }),
    prisma.smsMessage.count({ where: { status: "failed" } }),
    prisma.smsMessage.count({ where: { status: { in: ["queued", "waiting"] } } }),
    prisma.smsCampaign.count(),
    prisma.smsCampaign.count({ where: { status: "running" } }),
    prisma.smsCampaign.count({ where: { status: "queued" } }),
    prisma.smsCampaign.count({ where: { status: "completed" } }),
    prisma.smsProvider.count(),
    prisma.smsProvider.count({ where: { isActive: true } }),
  ]);

  return ok({
    users: { total: totalUsers, active: activeUsers, inactive: totalUsers - activeUsers },
    credits: { totalBalance: Number(totalCredits._sum.smsCreditBalance ?? 0) },
    messages: {
      today: todayMessages,
      month: monthMessages,
      success,
      failed,
      pending,
    },
    campaigns: {
      total: totalCampaigns,
      active: activeCampaigns,
      queued: queuedCampaigns,
      completed: completedCampaigns,
    },
    providers: {
      total: totalProviders,
      active: activeProviders,
      healthy: activeProviders,
      unhealthy: totalProviders - activeProviders,
    },
    queue: { waiting: pending, active: activeCampaigns, completed: completedCampaigns, failed },
  });
}
