import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const { page, limit, skip } = parsePagination(new URL(req.url));

  const [items, total] = await Promise.all([
    prisma.smsCreditTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsCreditTransaction.count({ where: { userId: id } }),
  ]);
  return ok({ items, total, page, limit });
}
