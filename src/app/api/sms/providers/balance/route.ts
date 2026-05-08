import { providerBalance } from "@/modules/sms/provider.service";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const providerId =
    searchParams.get("providerId") ??
    (await prisma.user.findUnique({ where: { id: auth.user.id }, select: { defaultProviderId: true } }))?.defaultProviderId;

  if (!providerId) return fail("Sağlayıcı bulunamadı.", 404);
  const balance = await providerBalance(providerId);
  return ok(balance);
}
