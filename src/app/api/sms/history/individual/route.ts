import { ok, parsePagination } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, page, skip } = parsePagination(url);
  const [items, total] = await Promise.all([
    prisma.smsMessage.findMany({
      where: { userId: auth.user.id, type: "individual" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsMessage.count({ where: { userId: auth.user.id, type: "individual" } }),
  ]);
  return ok({ items, total, page, limit });
}
