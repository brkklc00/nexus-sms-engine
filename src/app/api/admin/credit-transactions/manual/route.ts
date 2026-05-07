import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { applyCreditChange } from "@/modules/sms/credit.service";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  amount: z.number(),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;
  const result = await applyCreditChange({
    userId: parsed.data.userId,
    amount: parsed.data.amount,
    reason: parsed.data.reason ?? "Admin manuel kredi islemi",
    type: parsed.data.amount >= 0 ? "add" : "adjustment",
    createdById: auth.user.id,
  });
  await writeAuditLog({
    userId: auth.user.id,
    action: "CREDIT_MANUAL",
    entityType: "SmsCreditTransaction",
    entityId: result.id,
    metadata: { userId: parsed.data.userId, amount: parsed.data.amount, reason: parsed.data.reason },
  });
  return ok(result);
}
