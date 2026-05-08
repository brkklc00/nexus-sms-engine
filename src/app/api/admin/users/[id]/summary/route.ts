import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      smsCreditBalance: true,
      smsMarkupPercent: true,
      createdAt: true,
      updatedAt: true,
      defaultProvider: { select: { id: true, name: true } },
    },
  });
  if (!user) return fail("Kullanıcı bulunamadı.", 404);

  const [recentCredits, recentCampaigns, phoneBookCount, blacklistCount, recentSession] =
    await Promise.all([
      prisma.smsCreditTransaction.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.smsCampaign.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, createdAt: true, totalCount: true },
      }),
      prisma.smsPhoneBook.count({ where: { userId: id } }),
      prisma.smsBlacklist.count({ where: { userId: id } }),
      prisma.session.findFirst({ where: { userId: id }, orderBy: { expires: "desc" }, select: { expires: true } }),
    ]);

  return ok({
    user,
    stats: {
      phoneBookCount,
      blacklistCount,
      lastLoginAt: recentSession?.expires ?? null,
    },
    recentCredits,
    recentCampaigns,
  });
}
