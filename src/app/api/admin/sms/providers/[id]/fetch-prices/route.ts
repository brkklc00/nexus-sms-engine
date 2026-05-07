import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { providerPrices } from "@/modules/sms/provider.service";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  try {
    const prices = await providerPrices(id);
    return ok(prices);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Fiyatlar alinamadi.", 500);
  }
}
