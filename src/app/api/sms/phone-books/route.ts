import { ok, parsePagination } from "@/lib/http";
import { phoneBookCreateSchema } from "@/lib/schemas";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, skip, page } = parsePagination(url);
  const [items, total] = await Promise.all([
    prisma.smsPhoneBook.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.smsPhoneBook.count({ where: { userId: auth.user.id } }),
  ]);
  return ok({ items, total, page, limit });
}

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, phoneBookCreateSchema);
  if ("error" in parsed) return parsed.error;
  const phoneBook = await prisma.smsPhoneBook.create({
    data: { ...parsed.data, userId: auth.user.id },
  });
  return ok(phoneBook);
}
