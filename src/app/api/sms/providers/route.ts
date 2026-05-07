import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/http";
import { requireApiUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const providers = await prisma.smsProvider.findMany({
    where: { isActive: true },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, baseUrl: true, priority: true },
  });
  return ok(providers);
}
