import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, page, skip } = parsePagination(url);
  const userId = url.searchParams.get("userId") ?? undefined;
  const type = url.searchParams.get("type") ?? undefined;
  const where = {
    ...(userId ? { userId } : {}),
    ...(type ? { type: type as never } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.smsCreditTransaction.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        createdBy: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsCreditTransaction.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}
