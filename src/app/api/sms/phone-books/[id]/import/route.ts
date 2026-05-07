import { ok } from "@/lib/http";
import { normalizePhone, parsePhoneInput } from "@/lib/phone";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { z } from "zod";

const importSchema = z.object({
  numbersText: z.string().min(1),
  globalDedupe: z.boolean().default(false),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, importSchema);
  if ("error" in parsed) return parsed.error;

  const rows = parsePhoneInput(parsed.data.numbersText).map((raw) => normalizePhone(raw));
  const valid = rows.filter((r) => r.isValid && r.e164);
  const invalid = rows.length - valid.length;
  const set = new Set(valid.map((v) => v.e164 as string));
  let numbers = [...set];

  if (parsed.data.globalDedupe) {
    const existing = await prisma.smsContact.findMany({
      where: { userId: auth.user.id, phoneE164: { in: numbers } },
      select: { phoneE164: true },
    });
    const existingSet = new Set(existing.map((e) => e.phoneE164).filter(Boolean));
    numbers = numbers.filter((n) => !existingSet.has(n));
  }

  const blacklisted = await prisma.smsBlacklist.findMany({
    where: { OR: [{ userId: null }, { userId: auth.user.id }], phoneE164: { in: numbers } },
    select: { phoneE164: true },
  });
  const blocked = new Set(blacklisted.map((b) => b.phoneE164));
  const cleaned = numbers.filter((n) => !blocked.has(n));

  const created = await prisma.smsContact.createMany({
    data: cleaned.map((phone) => ({
      userId: auth.user.id,
      phoneBookId: id,
      phoneRaw: phone,
      phoneE164: phone,
      isValid: true,
      isBlacklisted: false,
    })),
    skipDuplicates: true,
  });

  const pb = await prisma.smsContact.aggregate({
    where: { phoneBookId: id },
    _count: { _all: true },
  });
  await prisma.smsPhoneBook.update({
    where: { id },
    data: {
      totalCount: pb._count._all,
      validCount: pb._count._all,
      invalidCount: invalid,
      blacklistedCount: blocked.size,
    },
  });

  return ok({
    imported: created.count,
    total: rows.length,
    valid: valid.length,
    invalid,
    blacklisted: blocked.size,
    duplicatesSkipped: valid.length - cleaned.length,
  });
}
