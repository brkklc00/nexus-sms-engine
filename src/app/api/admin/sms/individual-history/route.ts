import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url);
  const userId = url.searchParams.get("userId") ?? undefined;
  const where = { type: "individual" as const, ...(userId ? { userId } : {}) };
  const [items, total] = await Promise.all([
    prisma.smsMessage.findMany({
      where,
      include: { user: { select: { email: true, name: true } }, provider: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsMessage.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}
