import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url);
  const userId = url.searchParams.get("userId") ?? undefined;

  const where = userId ? { userId } : {};
  const [items, total] = await Promise.all([
    prisma.smsBlacklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsBlacklist.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}
