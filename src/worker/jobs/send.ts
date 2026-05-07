import { Job } from "bullmq";
import { SmsMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { providerRegistry } from "@/modules/sms/providers/registry";
import type { SmsSendJob } from "@/modules/sms/queue";
import { enqueueReportSync } from "@/modules/sms/campaign.service";

export async function handleSmsSend(job: Job<SmsSendJob>) {
  const { campaignId, providerId, messageIds } = job.data;
  const provider = await prisma.smsProvider.findUniqueOrThrow({ where: { id: providerId } });
  const adapter = providerRegistry(provider);

  const messages = await prisma.smsMessage.findMany({
    where: { id: { in: messageIds }, status: SmsMessageStatus.queued },
    select: { id: true, phoneE164: true, message: true, origin: true },
  });
  if (!messages.length) {
    return { skipped: true };
  }

  const submit = await adapter.submit({
    origin: messages[0].origin,
    message: messages[0].message,
    numbers: messages.map((m) => m.phoneE164),
  });

  if (!submit.ok) {
    logger.error({ campaignId, error: submit.error }, "SMS chunk gonderimi basarisiz");
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
