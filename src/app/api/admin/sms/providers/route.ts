import { requireAdmin } from "@/lib/api-auth";
import { ok } from "@/lib/http";
import { providerCreateSchema } from "@/lib/schemas";
import { parseJson } from "@/lib/validate";
import { writeAuditLog } from "@/lib/audit";
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
  await writeAuditLog({
    userId: auth.user.id,
    action: "PROVIDER_CREATE",
    entityType: "SmsProvider",
    entityId: provider.id,
    metadata: { name: provider.name, slug: provider.slug },
  });
  return ok(provider);
}
