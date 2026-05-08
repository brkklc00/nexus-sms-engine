import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { applyCreditChange } from "@/modules/sms/credit.service";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["add", "deduct"]),
  amount: z.number().positive(),
  description: z.string().min(2).max(500).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const isDeduct = parsed.data.type === "deduct";
    const result = await applyCreditChange({
      userId: id,
      type: parsed.data.type,
      amount: isDeduct ? -parsed.data.amount : parsed.data.amount,
      reason: parsed.data.description ?? "Admin kredi işlemi",
      createdById: auth.user.id,
    });
    await writeAuditLog({
      userId: auth.user.id,
      action: "USER_CREDIT_CHANGE",
      entityType: "User",
      entityId: id,
      metadata: {
        type: parsed.data.type,
        amount: parsed.data.amount,
        description: parsed.data.description,
      },
    });
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Yetersiz kredi")) {
      return fail("Kredi düşme işlemi sonrası bakiye negatif olamaz.", 422);
    }
    return fail("Kredi işlemi başarısız.", 500);
  }
}
