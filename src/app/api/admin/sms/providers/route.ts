import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { providerCreateSchema } from "@/lib/schemas";
import { parseJson } from "@/lib/validate";
import { listProviders, upsertProvider } from "@/modules/sms/provider.service";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  return ok(await listProviders(true));
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, providerCreateSchema);
  if ("error" in parsed) return parsed.error;
  const provider = await upsertProvider({
    ...parsed.data,
    token: parsed.data.token,
    tokenEncrypted: "",
  });
  return ok(provider);
}
