import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { applyCreditChange } from "@/modules/sms/credit.service";
import { z } from "zod";

const schema = z.object({
  amount: z.number(),
  reason: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  const type = parsed.data.amount >= 0 ? "add" : "adjustment";
  const result = await applyCreditChange({
    userId: id,
    type,
    amount: parsed.data.amount,
    reason: parsed.data.reason ?? "Admin kredi islemi",
    createdById: auth.user.id,
  });
  return ok(result);
}
