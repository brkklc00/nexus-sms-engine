import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, page, skip } = parsePagination(url);
  const q = url.searchParams.get("q") ?? undefined;

  const where = {
    OR: [{ userId: auth.user.id }, { userId: null }],
    ...(q ? { phoneE164: { contains: q } } : {}),
  };
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
