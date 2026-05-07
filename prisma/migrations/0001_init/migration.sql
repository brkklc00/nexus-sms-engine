-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'customer');

-- CreateEnum
CREATE TYPE "BlacklistSource" AS ENUM ('manual', 'import', 'provider');

-- CreateEnum
CREATE TYPE "SmsCampaignTargetType" AS ENUM ('phonebook', 'paste');

-- CreateEnum
CREATE TYPE "SmsCampaignStatus" AS ENUM ('queued', 'running', 'paused', 'completed', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "SmsMessageType" AS ENUM ('bulk', 'individual', 'otp');

-- CreateEnum
CREATE TYPE "SmsMessageStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed', 'waiting', 'skipped');

-- CreateEnum
CREATE TYPE "SmsCreditTransactionType" AS ENUM ('add', 'deduct', 'refund', 'adjustment', 'reserve', 'release');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "smsCreditBalance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "smsMarkupPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "defaultProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "tokenEncrypted" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 15,
    "dailyLimit" INTEGER,
    "hourlyLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsPhoneBook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "validCount" INTEGER NOT NULL DEFAULT 0,
    "invalidCount" INTEGER NOT NULL DEFAULT 0,
    "blacklistedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsPhoneBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneBookId" TEXT NOT NULL,
    "phoneRaw" TEXT NOT NULL,
    "phoneE164" TEXT,
    "countryCode" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsBlacklist" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phoneE164" TEXT NOT NULL,
    "reason" TEXT,
    "source" "BlacklistSource" NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCampaign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetType" "SmsCampaignTargetType" NOT NULL,
    "phoneBookId" TEXT,
    "status" "SmsCampaignStatus" NOT NULL DEFAULT 'queued',
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "queuedCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "waitingCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "costReserved" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "costFinal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "providerReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "providerId" TEXT NOT NULL,
    "type" "SmsMessageType" NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "status" "SmsMessageStatus" NOT NULL DEFAULT 'queued',
    "providerReportId" TEXT,
    "providerMessageId" TEXT,
    "error" TEXT,
    "cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SmsCreditTransactionType" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "balanceBefore" DECIMAL(18,4) NOT NULL,
    "balanceAfter" DECIMAL(18,4) NOT NULL,
    "reason" TEXT,
    "relatedCampaignId" TEXT,
    "relatedMessageId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsCreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsProviderPriceCache" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "price" DECIMAL(18,6) NOT NULL,
    "currency" TEXT,
    "raw" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsProviderPriceCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsOtpHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "codeHash" TEXT,
    "status" TEXT NOT NULL,
    "providerReportId" TEXT,
    "cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "SmsOtpHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SmsProvider_slug_key" ON "SmsProvider"("slug");

-- CreateIndex
CREATE INDEX "SmsProvider_isActive_priority_idx" ON "SmsProvider"("isActive", "priority");

-- CreateIndex
CREATE INDEX "SmsPhoneBook_userId_createdAt_idx" ON "SmsPhoneBook"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SmsPhoneBook_userId_name_key" ON "SmsPhoneBook"("userId", "name");

-- CreateIndex
CREATE INDEX "SmsContact_userId_phoneBookId_isValid_idx" ON "SmsContact"("userId", "phoneBookId", "isValid");

-- CreateIndex
CREATE UNIQUE INDEX "SmsContact_phoneBookId_phoneE164_key" ON "SmsContact"("phoneBookId", "phoneE164");

-- CreateIndex
CREATE INDEX "SmsBlacklist_phoneE164_idx" ON "SmsBlacklist"("phoneE164");

-- CreateIndex
CREATE INDEX "SmsBlacklist_userId_createdAt_idx" ON "SmsBlacklist"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SmsBlacklist_userId_phoneE164_key" ON "SmsBlacklist"("userId", "phoneE164");

-- CreateIndex
CREATE INDEX "SmsCampaign_userId_status_createdAt_idx" ON "SmsCampaign"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SmsCampaign_providerId_status_createdAt_idx" ON "SmsCampaign"("providerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SmsMessage_userId_status_createdAt_idx" ON "SmsMessage"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SmsMessage_campaignId_status_idx" ON "SmsMessage"("campaignId", "status");

-- CreateIndex
CREATE INDEX "SmsMessage_providerId_status_createdAt_idx" ON "SmsMessage"("providerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SmsCreditTransaction_userId_createdAt_idx" ON "SmsCreditTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SmsCreditTransaction_relatedCampaignId_idx" ON "SmsCreditTransaction"("relatedCampaignId");

-- CreateIndex
CREATE INDEX "SmsCreditTransaction_relatedMessageId_idx" ON "SmsCreditTransaction"("relatedMessageId");

-- CreateIndex
CREATE INDEX "SmsProviderPriceCache_providerId_updatedAt_idx" ON "SmsProviderPriceCache"("providerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SmsProviderPriceCache_providerId_countryCode_key" ON "SmsProviderPriceCache"("providerId", "countryCode");

-- CreateIndex
CREATE INDEX "SmsOtpHistory_userId_createdAt_idx" ON "SmsOtpHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SmsOtpHistory_providerId_status_createdAt_idx" ON "SmsOtpHistory"("providerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultProviderId_fkey" FOREIGN KEY ("defaultProviderId") REFERENCES "SmsProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsPhoneBook" ADD CONSTRAINT "SmsPhoneBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsContact" ADD CONSTRAINT "SmsContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsContact" ADD CONSTRAINT "SmsContact_phoneBookId_fkey" FOREIGN KEY ("phoneBookId") REFERENCES "SmsPhoneBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsBlacklist" ADD CONSTRAINT "SmsBlacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaign" ADD CONSTRAINT "SmsCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaign" ADD CONSTRAINT "SmsCampaign_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "SmsProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCampaign" ADD CONSTRAINT "SmsCampaign_phoneBookId_fkey" FOREIGN KEY ("phoneBookId") REFERENCES "SmsPhoneBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SmsCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "SmsProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_relatedCampaignId_fkey" FOREIGN KEY ("relatedCampaignId") REFERENCES "SmsCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_relatedMessageId_fkey" FOREIGN KEY ("relatedMessageId") REFERENCES "SmsMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsCreditTransaction" ADD CONSTRAINT "SmsCreditTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsProviderPriceCache" ADD CONSTRAINT "SmsProviderPriceCache_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "SmsProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsOtpHistory" ADD CONSTRAINT "SmsOtpHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsOtpHistory" ADD CONSTRAINT "SmsOtpHistory_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "SmsProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

