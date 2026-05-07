import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { parsePhoneInput, normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";
import { z } from "zod";

const schema = z.object({
  numbersText: z.string().min(1),
  reason: z.string().optional(),
  source: z.enum(["manual", "import", "provider"]).default("manual"),
});

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  const numbers = parsePhoneInput(parsed.data.numbersText)
    .map((n) => normalizePhone(n))
    .filter((n) => n.isValid && n.e164)
    .map((n) => n.e164 as string);

  const created = await prisma.smsBlacklist.createMany({
    data: [...new Set(numbers)].map((phoneE164) => ({
      userId: auth.user.id,
      phoneE164,
      reason: parsed.data.reason,
      source: parsed.data.source,
    })),
    skipDuplicates: true,
  });
  return ok({ created: created.count });
}
