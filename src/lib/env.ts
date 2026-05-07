import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  SMS_SECRET_KEY: z.string().min(16),
  DEFAULT_SMS_PROVIDER_BASE_URL: z.string().url(),
  DEFAULT_SMS_PROVIDER_TOKEN: z.string().optional(),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  SMS_SEND_CHUNK_SIZE: z.coerce.number().int().positive().default(100),
  SMS_REPORT_SYNC_INTERVAL_SECONDS: z.coerce.number().int().positive().default(300),
  ENABLE_SEED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
  SEED_ADMIN_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Gecersiz ortam degiskenleri", parsed.error.flatten().fieldErrors);
  throw new Error("Ortam degiskenleri dogrulanamadi.");
}

export const env = parsed.data;
