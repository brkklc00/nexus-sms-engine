import crypto from "node:crypto";
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function parseBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function normalizeKey(secret: string): Buffer {
  if (secret.startsWith("base64:")) {
    return Buffer.from(secret.replace("base64:", ""), "base64");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptSecret(value: string, secretKey: string): string {
  const key = normalizeKey(secretKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

async function seed() {
  if (!parseBoolean(process.env.ENABLE_SEED, false)) {
    console.log("ENABLE_SEED=false, seed atlandi.");
    return;
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@sms.hub-nexus.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Sistem Yonetici";
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: UserRole.admin,
      isActive: true,
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: UserRole.admin,
      isActive: true,
      passwordHash,
    },
  });

  const defaultProviderToken = process.env.DEFAULT_SMS_PROVIDER_TOKEN;
  const smsSecretKey = process.env.SMS_SECRET_KEY;
  const defaultProviderBaseUrl =
    process.env.DEFAULT_SMS_PROVIDER_BASE_URL ??
    "https://www.dise.uipapp.com/api/international-sms/";

  if (defaultProviderToken) {
    if (!smsSecretKey) {
      throw new Error("DEFAULT_SMS_PROVIDER_TOKEN verildiyse SMS_SECRET_KEY zorunludur.");
    }

    const provider = await prisma.smsProvider.upsert({
      where: { slug: "uipapp-dise" },
      update: {
        name: "Uipapp / Dise International SMS",
        baseUrl: defaultProviderBaseUrl,
        tokenEncrypted: encryptSecret(defaultProviderToken, smsSecretKey),
        isActive: true,
        priority: 1,
      },
      create: {
        name: "Uipapp / Dise International SMS",
        slug: "uipapp-dise",
        baseUrl: defaultProviderBaseUrl,
        tokenEncrypted: encryptSecret(defaultProviderToken, smsSecretKey),
        isActive: true,
        priority: 1,
      },
    });

    await prisma.user.update({
      where: { id: admin.id },
      data: { defaultProviderId: provider.id },
    });
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
