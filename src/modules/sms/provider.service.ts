import { Prisma } from "@prisma/client";
import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { providerRegistry } from "@/modules/sms/providers/registry";

export async function listProviders(includePassive = false) {
  return prisma.smsProvider.findMany({
    where: includePassive ? {} : { isActive: true },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });
}

export async function upsertProvider(
  input: Prisma.SmsProviderUncheckedCreateInput & { token?: string },
) {
  return prisma.smsProvider.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      baseUrl: input.baseUrl,
      isActive: input.isActive,
      priority: input.priority,
      timeoutSeconds: input.timeoutSeconds,
      dailyLimit: input.dailyLimit ?? null,
      hourlyLimit: input.hourlyLimit ?? null,
      ...(input.token ? { tokenEncrypted: encryptSecret(input.token) } : {}),
    },
    create: {
      name: input.name,
      slug: input.slug,
      baseUrl: input.baseUrl,
      tokenEncrypted: encryptSecret(input.token ?? ""),
      isActive: input.isActive,
      priority: input.priority,
      timeoutSeconds: input.timeoutSeconds,
      dailyLimit: input.dailyLimit ?? null,
      hourlyLimit: input.hourlyLimit ?? null,
    },
  });
}

export async function providerBalance(providerId: string) {
  const provider = await prisma.smsProvider.findUniqueOrThrow({ where: { id: providerId } });
  return providerRegistry(provider).balance();
}

export async function providerPrices(providerId: string) {
  const provider = await prisma.smsProvider.findUniqueOrThrow({ where: { id: providerId } });
  const result = await providerRegistry(provider).prices();

  await prisma.$transaction(
    (result.prices ?? []).map((row) => {
      const item = row as Record<string, unknown>;
      const countryCode = String(item.country_code ?? item.country ?? "XX");
      const price = Number(item.price ?? 0);
      const currency = item.currency ? String(item.currency) : null;
      return prisma.smsProviderPriceCache.upsert({
        where: { providerId_countryCode: { providerId, countryCode } },
        update: { price, currency, raw: row as Prisma.InputJsonValue },
        create: { providerId, countryCode, price, currency, raw: row as Prisma.InputJsonValue },
      });
    }),
  );
  return result;
}
