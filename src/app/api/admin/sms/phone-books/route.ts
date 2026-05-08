import { requireAdmin } from "@/lib/api-auth";
import { ok, parsePagination } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
});

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

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, createSchema);
  if ("error" in parsed) return parsed.error;
  const item = await prisma.smsPhoneBook.create({
    data: {
      userId: parsed.data.userId,
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });
  return ok(item);
}
