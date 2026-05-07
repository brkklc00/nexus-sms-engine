import { applyRateLimit } from "@/lib/rate-limit";
import { fail, ok } from "@/lib/http";
import { individualSendSchema } from "@/lib/schemas";
import { parseJson } from "@/lib/validate";
import { requireApiUser } from "@/lib/api-auth";
import { createIndividualSend } from "@/modules/sms/campaign.service";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const rate = await applyRateLimit(`send:individual:${auth.user.id}`, 30, 60);
  if (!rate.ok) return fail("Cok fazla istek.", 429);

  const parsed = await parseJson(req, individualSendSchema);
  if ("error" in parsed) return parsed.error;

  const result = await createIndividualSend({ ...parsed.data, userId: auth.user.id });
  return ok(result);
}
