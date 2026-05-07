import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { encryptSecret } from "@/lib/crypto";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

async function seed() {
  if (!env.ENABLE_SEED) {
    console.log("ENABLE_SEED=false, seed atlandi.");
    return;
  }

  const adminEmail = env.SEED_ADMIN_EMAIL ?? "admin@nexus.local";
  const adminPassword = env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const adminName = env.SEED_ADMIN_NAME ?? "Sistem Yonetici";
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

  if (env.DEFAULT_SMS_PROVIDER_TOKEN) {
    const provider = await prisma.smsProvider.upsert({
      where: { slug: "uipapp-dise" },
      update: {
        name: "Uipapp / Dise International SMS",
        baseUrl: env.DEFAULT_SMS_PROVIDER_BASE_URL,
        tokenEncrypted: encryptSecret(env.DEFAULT_SMS_PROVIDER_TOKEN),
        isActive: true,
        priority: 1,
      },
      create: {
        name: "Uipapp / Dise International SMS",
        slug: "uipapp-dise",
        baseUrl: env.DEFAULT_SMS_PROVIDER_BASE_URL,
        tokenEncrypted: encryptSecret(env.DEFAULT_SMS_PROVIDER_TOKEN),
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
