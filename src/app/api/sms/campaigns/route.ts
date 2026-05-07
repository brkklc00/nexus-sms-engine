import { prisma } from "@/lib/prisma";
import { ok, parsePagination } from "@/lib/http";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, skip, page } = parsePagination(url);
  const q = url.searchParams.get("q") ?? undefined;

  const where = {
    userId: auth.user.id,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.smsCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsCampaign.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}
