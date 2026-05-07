import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { page, limit, skip } = parsePagination(new URL(req.url));
  const [items, total] = await Promise.all([
    prisma.smsOtpHistory.findMany({
      include: { user: { select: { email: true, name: true } }, provider: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsOtpHistory.count(),
  ]);
  return ok({ items, total, page, limit });
}
