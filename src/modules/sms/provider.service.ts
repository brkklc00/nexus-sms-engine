import { Prisma } from "@prisma/client";
import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { providerRegistry } from "@/modules/sms/providers/registry";

const providerPublicSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  baseUrl: true,
  isActive: true,
  priority: true,
  timeoutSeconds: true,
  dailyLimit: true,
  hourlyLimit: true,
  targetRatePerSecond: true,
  maxRatePerSecond: true,
  warmupEnabled: true,
  warmupStartRps: true,
  warmupIncrementStep: true,
  warmupMaxRps: true,
  dailyCap: true,
  hourlyCap: true,
  minuteCap: true,
  isThrottled: true,
  throttleReason: true,
  cooldownUntil: true,
  lastError: true,
  healthStatus: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SmsProviderSelect;

export async function listProviders(includePassive = false) {
  return prisma.smsProvider.findMany({
    where: includePassive ? { deletedAt: null } : { isActive: true, deletedAt: null },
    select: providerPublicSelect,
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
      type: input.type ?? "smtp",
      isActive: input.isActive,
      priority: input.priority,
      timeoutSeconds: input.timeoutSeconds,
      dailyLimit: input.dailyLimit ?? null,
      hourlyLimit: input.hourlyLimit ?? null,
      targetRatePerSecond: input.targetRatePerSecond ?? 0.5,
      maxRatePerSecond: input.maxRatePerSecond ?? 1,
      warmupEnabled: input.warmupEnabled ?? true,
      warmupStartRps: input.warmupStartRps ?? 0.2,
      warmupIncrementStep: input.warmupIncrementStep ?? 0.2,
      warmupMaxRps: input.warmupMaxRps ?? 2,
      dailyCap: input.dailyCap ?? null,
      hourlyCap: input.hourlyCap ?? null,
      minuteCap: input.minuteCap ?? null,
      ...(input.token ? { tokenEncrypted: encryptSecret(input.token) } : {}),
    },
    create: {
      name: input.name,
      slug: input.slug,
      type: input.type ?? "smtp",
      baseUrl: input.baseUrl,
      tokenEncrypted: encryptSecret(input.token ?? ""),
      isActive: input.isActive,
      priority: input.priority,
      timeoutSeconds: input.timeoutSeconds,
      dailyLimit: input.dailyLimit ?? null,
      hourlyLimit: input.hourlyLimit ?? null,
      targetRatePerSecond: input.targetRatePerSecond ?? 0.5,
      maxRatePerSecond: input.maxRatePerSecond ?? 1,
      warmupEnabled: input.warmupEnabled ?? true,
      warmupStartRps: input.warmupStartRps ?? 0.2,
      warmupIncrementStep: input.warmupIncrementStep ?? 0.2,
      warmupMaxRps: input.warmupMaxRps ?? 2,
      dailyCap: input.dailyCap ?? null,
      hourlyCap: input.hourlyCap ?? null,
      minuteCap: input.minuteCap ?? null,
    },
    select: providerPublicSelect,
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
