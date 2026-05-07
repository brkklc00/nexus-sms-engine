import crypto from "node:crypto";
import { env } from "@/lib/env";

const PREFIX = "enc:v1:";

function normalizeKey(secret: string): Buffer {
  if (secret.startsWith("base64:")) {
    return Buffer.from(secret.replace("base64:", ""), "base64");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

const key = normalizeKey(env.SMS_SECRET_KEY);

export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  if (!payload.startsWith(PREFIX)) {
    throw new Error("Bilinmeyen sifreli deger formati.");
  }
  const normalized = payload.replace(PREFIX, "");
  const [ivRaw, tagRaw, dataRaw] = normalized.split(".");
  const iv = Buffer.from(ivRaw, "base64");
  const tag = Buffer.from(tagRaw, "base64");
  const encrypted = Buffer.from(dataRaw, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function maskPhone(value: string): string {
  if (value.length <= 4) return "****";
  return `${value.slice(0, 3)}****${value.slice(-2)}`;
}
