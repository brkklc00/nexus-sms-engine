import { applyRateLimit } from "@/lib/rate-limit";
import { bulkSendSchema } from "@/lib/schemas";
import { parseJson } from "@/lib/validate";
import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { requireApiUser } from "@/lib/api-auth";
import { createBulkCampaign, estimateBulkCost } from "@/modules/sms/campaign.service";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const limit = await applyRateLimit(`send:bulk:${auth.user.id}`, 20, 60);
  if (!limit.ok) return fail("Cok fazla istek.", 429);

  const parsed = await parseJson(req, bulkSendSchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.targetType === "phonebook" && !parsed.data.phoneBookId) {
    return fail("Rehber secimi zorunlu.", 422);
  }

  const payload = {
    ...parsed.data,
    userId: auth.user.id,
    chunkSize: parsed.data.chunkSize ?? env.SMS_SEND_CHUNK_SIZE,
  };
  const estimation = await estimateBulkCost(payload);
  const campaign = await createBulkCampaign(payload);

  return ok({ campaign, estimation });
}
