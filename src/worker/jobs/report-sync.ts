import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { providerRegistry } from "@/modules/sms/providers/registry";
import type { SmsReportSyncJob } from "@/modules/sms/queue";

export async function handleReportSync(job: Job<SmsReportSyncJob>) {
  const { campaignId, providerId, reportId } = job.data;
  const provider = await prisma.smsProvider.findUniqueOrThrow({ where: { id: providerId } });
  const adapter = providerRegistry(provider);
  const report = await adapter.report(reportId);

  const allMessages = await prisma.smsMessage.findMany({
    where: { campaignId },
    select: { id: true },
  });

  await prisma.smsCampaign.update({
    where: { id: campaignId },
    data: {
      waitingCount: report.waiting,
      deliveredCount: report.delivered,
      failedCount: report.undelivered,
      status: report.waiting === 0 ? "completed" : "running",
      completedAt: report.waiting === 0 ? new Date() : null,
    },
  });

  if (report.waiting === 0) {
    await prisma.smsMessage.updateMany({
      where: { id: { in: allMessages.map((m) => m.id) }, status: { in: ["queued", "sent", "waiting"] } },
      data: { status: "delivered", deliveredAt: new Date() },
    });
  }

  return report;
}
