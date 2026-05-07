import { requireApiUser } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { page, limit, skip } = parsePagination(new URL(req.url));
  const [items, total] = await Promise.all([
    prisma.smsCreditTransaction.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsCreditTransaction.count({ where: { userId: auth.user.id } }),
  ]);
  return ok({ items, total, page, limit });
}
