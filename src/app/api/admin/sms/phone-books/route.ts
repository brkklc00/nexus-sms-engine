import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { page, limit, skip } = parsePagination(url);
  const userId = url.searchParams.get("userId") ?? undefined;
  const [items, total] = await Promise.all([
    prisma.smsPhoneBook.findMany({
      where: userId ? { userId } : {},
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsPhoneBook.count({ where: userId ? { userId } : {} }),
  ]);
  return ok({ items, total, page, limit });
}
