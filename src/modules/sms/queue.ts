import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export type SmsSendJob = {
  campaignId: string;
  providerId: string;
  chunkIndex: number;
  messageIds: string[];
};

export type SmsReportSyncJob = {
  campaignId: string;
  providerId: string;
  reportId: string;
};

export const smsSendQueue = new Queue<SmsSendJob, unknown, string>("sms-send", {
  connection: redis,
  defaultJobOptions: {
    attempts: 4,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const smsReportSyncQueue = new Queue<SmsReportSyncJob, unknown, string>("sms-report-sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 4,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
