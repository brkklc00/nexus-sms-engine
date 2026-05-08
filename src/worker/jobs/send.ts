import { Job } from "bullmq";
import { SmsMessageStatus } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { providerRegistry } from "@/modules/sms/providers/registry";
import type { SmsSendJob } from "@/modules/sms/queue";
import { enqueueReportSync } from "@/modules/sms/campaign.service";

class RateLimitDelayedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitDelayedError";
  }
}

function isRateLikeError(message: string | null | undefined) {
  if (!message) return false;
  return /(rate|429|throttle|cooldown|limit|timeout)/i.test(message);
}

function resolveEffectiveRps(provider: {
  targetRatePerSecond: number;
  maxRatePerSecond: number;
  warmupEnabled: boolean;
  warmupStartRps: number;
  warmupIncrementStep: number;
  warmupMaxRps: number;
  createdAt: Date;
}) {
  const target = Math.max(0.01, provider.targetRatePerSecond);
  const max = Math.max(target, provider.maxRatePerSecond);
  if (!provider.warmupEnabled) return Math.min(target, max);
  const elapsedHours = Math.max(0, Math.floor((Date.now() - provider.createdAt.getTime()) / (60 * 60 * 1000)));
  const warmupRps = provider.warmupStartRps + elapsedHours * provider.warmupIncrementStep;
  return Math.max(0.01, Math.min(max, provider.warmupMaxRps, warmupRps));
}

async function ensureProviderRateAllowance(
  provider: {
    id: string;
    dailyCap: number | null;
    hourlyCap: number | null;
    minuteCap: number | null;
    isThrottled: boolean;
    cooldownUntil: Date | null;
    targetRatePerSecond: number;
    maxRatePerSecond: number;
    warmupEnabled: boolean;
    warmupStartRps: number;
    warmupIncrementStep: number;
    warmupMaxRps: number;
    createdAt: Date;
  },
  requestedCount: number,
) {
  if (provider.isThrottled && provider.cooldownUntil && provider.cooldownUntil.getTime() > Date.now()) {
    throw new RateLimitDelayedError("rate_limited_delayed");
  }

  const effectiveRps = resolveEffectiveRps(provider);
  const perMinuteByRps = Math.max(1, Math.floor(effectiveRps * 60));
  const minuteLimit = provider.minuteCap ?? perMinuteByRps;
  const now = new Date();
  const dayKey = `${provider.id}:${now.toISOString().slice(0, 10)}`;
  const hourKey = `${provider.id}:${now.toISOString().slice(0, 13)}`;
  const minuteKey = `${provider.id}:${now.toISOString().slice(0, 16)}`;

  const dayCount = Number((await redis.get(`smtp:daily:${dayKey}`)) ?? 0);
  const hourCount = Number((await redis.get(`smtp:hourly:${hourKey}`)) ?? 0);
  const minuteCount = Number((await redis.get(`smtp:minute:${minuteKey}`)) ?? 0);

  const dayLimit = provider.dailyCap ?? Number.MAX_SAFE_INTEGER;
  const hourLimit = provider.hourlyCap ?? Number.MAX_SAFE_INTEGER;
  if (
    dayCount + requestedCount > dayLimit ||
    hourCount + requestedCount > hourLimit ||
    minuteCount + requestedCount > minuteLimit
  ) {
    const cooldownUntil = new Date(Date.now() + env.RATE_LIMIT_WAIT_TIMEOUT_MS);
    await prisma.smsProvider.update({
      where: { id: provider.id },
      data: {
        isThrottled: true,
        throttleReason: "rate_limited_wait_timeout",
        cooldownUntil,
        healthStatus: "error",
      },
    });
    throw new RateLimitDelayedError("rate_limited_delayed");
  }

  const dayTtl = 60 * 60 * 24;
  const hourTtl = 60 * 60;
  const minuteTtl = 60;
  await redis
    .multi()
    .incrby(`smtp:daily:${dayKey}`, requestedCount)
    .expire(`smtp:daily:${dayKey}`, dayTtl)
    .incrby(`smtp:hourly:${hourKey}`, requestedCount)
    .expire(`smtp:hourly:${hourKey}`, hourTtl)
    .incrby(`smtp:minute:${minuteKey}`, requestedCount)
    .expire(`smtp:minute:${minuteKey}`, minuteTtl)
    .exec();
}

export async function handleSmsSend(job: Job<SmsSendJob>) {
  const { campaignId, providerId, messageIds } = job.data;
  const provider = await prisma.smsProvider.findUniqueOrThrow({
    where: { id: providerId },
  });
  const adapter = providerRegistry(provider);

  const messages = await prisma.smsMessage.findMany({
    where: { id: { in: messageIds }, status: SmsMessageStatus.queued },
    select: { id: true, phoneE164: true, message: true, origin: true },
  });
  if (!messages.length) {
    return { skipped: true };
  }

  try {
    await ensureProviderRateAllowance(provider, messages.length);
  } catch (error) {
    if (error instanceof RateLimitDelayedError) {
      const maxAttempts = job.opts.attempts ?? env.SMS_SEND_RETRY_LIMIT;
      if (job.attemptsMade + 1 >= maxAttempts) {
        await prisma.smsMessage.updateMany({
          where: { id: { in: messages.map((m) => m.id) } },
          data: { status: "failed", error: "Rate limit nedeniyle tekrar deneme limiti aşıldı." },
        });
        await prisma.smsCampaign.update({
          where: { id: campaignId },
          data: { failedCount: { increment: messages.length }, queuedCount: { decrement: messages.length } },
        });
      }
      logger.warn(
        {
          campaignId,
          providerId,
          chunkIndex: job.data.chunkIndex,
          attemptsMade: job.attemptsMade,
          delayMs: env.RATE_LIMIT_REQUEUE_DELAY_MS,
        },
        "rate_limited_delayed",
      );
      throw error;
    }
    throw error;
  }

  const submit = await adapter.submit({
    origin: messages[0].origin,
    message: messages[0].message,
    numbers: messages.map((m) => m.phoneE164),
  });

  if (!submit.ok) {
    if (isRateLikeError(submit.error)) {
      const maxAttempts = job.opts.attempts ?? env.SMS_SEND_RETRY_LIMIT;
      await prisma.smsProvider.update({
        where: { id: providerId },
        data: {
          isThrottled: true,
          throttleReason: "provider_rate_limited",
          cooldownUntil: new Date(Date.now() + env.RATE_LIMIT_WAIT_TIMEOUT_MS),
          lastError: submit.error ?? null,
          healthStatus: "error",
        },
      });
      logger.warn(
        { campaignId, providerId, error: submit.error, attemptsMade: job.attemptsMade },
        "rate_limited_delayed",
      );
      if (job.attemptsMade + 1 >= maxAttempts) {
        await prisma.smsMessage.updateMany({
          where: { id: { in: messages.map((m) => m.id) } },
          data: { status: "failed", error: submit.error ?? "Rate limit nedeniyle gönderilemedi." },
        });
        await prisma.smsCampaign.update({
          where: { id: campaignId },
          data: { failedCount: { increment: messages.length }, queuedCount: { decrement: messages.length } },
        });
      }
      throw new RateLimitDelayedError(submit.error ?? "rate_limited_delayed");
    }
    logger.error({ campaignId, error: submit.error }, "SMS chunk gonderimi basarisiz");
    await prisma.smsProvider.update({
      where: { id: providerId },
      data: { lastError: submit.error ?? null, healthStatus: "error" },
    });
    await prisma.smsMessage.updateMany({
      where: { id: { in: messages.map((m) => m.id) } },
      data: { status: "failed", error: submit.error },
    });
    await prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { failedCount: { increment: messages.length } },
    });
    throw new Error(submit.error ?? "Saglayici submit hatasi");
  }

  await prisma.smsMessage.updateMany({
    where: { id: { in: messages.map((m) => m.id) } },
    data: {
      status: "sent",
      sentAt: new Date(),
      providerReportId: submit.reportId,
    },
  });

  await prisma.smsProvider.update({
    where: { id: providerId },
    data: {
      isThrottled: false,
      throttleReason: null,
      cooldownUntil: null,
      healthStatus: "healthy",
      lastError: null,
    },
  });

  const campaign = await prisma.smsCampaign.update({
    where: { id: campaignId },
    data: {
      status: "running",
      startedAt: new Date(),
      sentCount: { increment: messages.length },
      queuedCount: { decrement: messages.length },
      providerReportId: submit.reportId ?? undefined,
    },
  });

  if (submit.reportId) {
    await enqueueReportSync(campaign.id, providerId, submit.reportId);
  }

  return { ok: true, reportId: submit.reportId };
}
