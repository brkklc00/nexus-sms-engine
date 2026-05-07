import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, skip, page } = parsePagination(url);
  const q = url.searchParams.get("q") ?? undefined;
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};
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
