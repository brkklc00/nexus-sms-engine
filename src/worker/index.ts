import { Worker } from "bullmq";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";
import { handleReportSync } from "@/worker/jobs/report-sync";
import { handleSmsSend } from "@/worker/jobs/send";
import type { SmsReportSyncJob, SmsSendJob } from "@/modules/sms/queue";

const sendWorker = new Worker<SmsSendJob>("sms-send", handleSmsSend, {
  connection: redis,
  concurrency: env.WORKER_CONCURRENCY,
  limiter: { max: 100, duration: 1000 },
});

const reportWorker = new Worker<SmsReportSyncJob>("sms-report-sync", handleReportSync, {
  connection: redis,
  concurrency: Math.max(1, Math.floor(env.WORKER_CONCURRENCY / 2)),
});

sendWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "sms-send tamamlandi");
});
sendWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, error: error.message }, "sms-send hatasi");
});

reportWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, error: error.message }, "sms-report-sync hatasi");
});

console.log("NEXUS SMS Worker calisiyor.");
