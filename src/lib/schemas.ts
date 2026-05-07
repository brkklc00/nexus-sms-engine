import { z } from "zod";

export const bulkSendSchema = z.object({
  name: z.string().min(2).max(120),
  message: z.string().min(1).max(1000),
  origin: z.string().min(2).max(20),
  providerId: z.string().min(1),
  phoneBookId: z.string().optional(),
  numbersText: z.string().optional(),
  targetType: z.enum(["phonebook", "paste"]),
  skipBlacklist: z.boolean().default(true),
  skipDuplicates: z.boolean().default(true),
  chunkSize: z.number().int().positive().max(500).optional(),
});

export const individualSendSchema = z.object({
  message: z.string().min(1).max(1000),
  origin: z.string().min(2).max(20),
  providerId: z.string().min(1),
  numbers: z.array(z.string()).min(1).max(10),
  queued: z.boolean().default(true),
});

export const phoneBookCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
});

export const providerCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  baseUrl: z.string().url(),
  token: z.string().min(3),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(100),
  timeoutSeconds: z.number().int().default(15),
  dailyLimit: z.number().int().nullable().optional(),
  hourlyLimit: z.number().int().nullable().optional(),
});
