import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(300).nullable().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const item = await prisma.smsPhoneBook.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      contacts: { take: 20, orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) return fail("Rehber bulunamadı.", 404);
  return ok(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, updateSchema);
  if ("error" in parsed) return parsed.error;
  const item = await prisma.smsPhoneBook.update({ where: { id }, data: parsed.data });
  return ok(item);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smsPhoneBook.deleteMany({ where: { id } });
  return ok({ deleted: true });
}
