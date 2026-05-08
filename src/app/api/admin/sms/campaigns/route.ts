import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, skip, page } = parsePagination(url);
  const q = url.searchParams.get("q") ?? undefined;
  const userId = url.searchParams.get("userId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const providerId = url.searchParams.get("providerId") ?? undefined;
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(userId ? { userId } : {}),
    ...(status ? { status: status as never } : {}),
    ...(providerId ? { providerId } : {}),
    ...((dateFrom || dateTo)
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.smsCampaign.findMany({
      where,
      include: { user: { select: { email: true, name: true } }, provider: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsCampaign.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}
