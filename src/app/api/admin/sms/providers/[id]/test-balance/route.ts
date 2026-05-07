import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { providerBalance } from "@/modules/sms/provider.service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  try {
    const balance = await providerBalance(id);
    return ok(balance);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Saglayici bakiyesi alinamadi.", 500);
  }
}
