import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { parsePhoneInput, normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  numbersText: z.string().min(1),
  userId: z.string().nullable().optional(),
  reason: z.string().optional(),
  source: z.enum(["manual", "import", "provider"]).default("manual"),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  const numbers = parsePhoneInput(parsed.data.numbersText)
    .map((item) => normalizePhone(item))
    .filter((item) => item.isValid && item.e164)
    .map((item) => item.e164 as string);

  const created = await prisma.smsBlacklist.createMany({
    data: [...new Set(numbers)].map((phoneE164) => ({
      userId: parsed.data.userId ?? null,
      phoneE164,
      reason: parsed.data.reason,
      source: parsed.data.source,
    })),
    skipDuplicates: true,
  });
  return ok({ created: created.count });
}
