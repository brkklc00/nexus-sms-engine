import { Prisma, SmsCampaignStatus, SmsMessageType, SmsMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone, parsePhoneInput } from "@/lib/phone";
import { applyCreditChange } from "@/modules/sms/credit.service";
import { smsReportSyncQueue, smsSendQueue } from "@/modules/sms/queue";

type BulkInput = {
  userId: string;
  providerId: string;
  name: string;
  origin: string;
  message: string;
  targetType: "phonebook" | "paste";
  phoneBookId?: string;
  numbersText?: string;
  skipBlacklist?: boolean;
  skipDuplicates?: boolean;
  chunkSize: number;
};

async function resolveNumbers(input: BulkInput) {
  if (input.targetType === "phonebook" && input.phoneBookId) {
    const contacts = await prisma.smsContact.findMany({
      where: { userId: input.userId, phoneBookId: input.phoneBookId, isValid: true },
      select: { phoneE164: true },
    });
    return contacts.map((c) => c.phoneE164).filter((v): v is string => Boolean(v));
  }

  const rawList = parsePhoneInput(input.numbersText ?? "");
  return rawList
    .map((phone) => normalizePhone(phone))
    .filter((p) => p.isValid && p.e164)
    .map((p) => p.e164 as string);
}

export async function estimateBulkCost(input: BulkInput) {
  let numbers = await resolveNumbers(input);
  const initial = numbers.length;

  if (input.skipDuplicates) {
    numbers = [...new Set(numbers)];
  }
  const duplicateSkipped = initial - numbers.length;

  let blacklistedSkipped = 0;
  if (input.skipBlacklist) {
    const blacklisted = await prisma.smsBlacklist.findMany({
      where: {
        OR: [{ userId: null }, { userId: input.userId }],
        phoneE164: { in: numbers },
      },
      select: { phoneE164: true },
    });
    const blocked = new Set(blacklisted.map((b) => b.phoneE164));
    const before = numbers.length;
    numbers = numbers.filter((n) => !blocked.has(n));
    blacklistedSkipped = before - numbers.length;
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: { smsMarkupPercent: true },
  });

  const basePriceRow = await prisma.smsProviderPriceCache.findFirst({
    where: { providerId: input.providerId },
    orderBy: { updatedAt: "desc" },
  });
  const basePrice = Number(basePriceRow?.price ?? 1);
  const unit = basePrice * (1 + Number(user.smsMarkupPercent) / 100);
  const estimatedCost = unit * numbers.length;

  return {
    numbers,
    validCount: numbers.length,
    duplicateSkipped,
    blacklistedSkipped,
    estimatedUnitCost: unit,
    estimatedCost,
  };
}

export async function createBulkCampaign(input: BulkInput) {
  const estimation = await estimateBulkCost(input);
  const required = new Prisma.Decimal(estimation.estimatedCost.toFixed(4));

  const campaign = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { smsCreditBalance: true },
    });
    if (user.smsCreditBalance.lessThan(required)) {
      throw new Error("Kredi yetersiz.");
    }

    const created = await tx.smsCampaign.create({
      data: {
        userId: input.userId,
        providerId: input.providerId,
        name: input.name,
        origin: input.origin,
        message: input.message,
        targetType: input.targetType,
        phoneBookId: input.phoneBookId,
        status: SmsCampaignStatus.queued,
        totalCount: estimation.validCount,
        queuedCount: estimation.validCount,
        waitingCount: estimation.validCount,
        skippedCount: estimation.blacklistedSkipped + estimation.duplicateSkipped,
        costReserved: required,
      },
    });

    const messageRows = await tx.smsMessage.createManyAndReturn({
      data: estimation.numbers.map((phone) => ({
        userId: input.userId,
        campaignId: created.id,
        providerId: input.providerId,
        type: SmsMessageType.bulk,
        phoneE164: phone,
        message: input.message,
        origin: input.origin,
        status: SmsMessageStatus.queued,
        cost: estimation.estimatedUnitCost,
      })),
      select: { id: true },
    });

    return { created, messageIds: messageRows.map((m) => m.id) };
  });

  await applyCreditChange({
    userId: input.userId,
    type: "reserve",
    amount: required.negated(),
    reason: "Toplu SMS kampanya rezervi",
    relatedCampaignId: campaign.created.id,
  });

  const chunkSize = input.chunkSize;
  const chunks: string[][] = [];
  for (let i = 0; i < campaign.messageIds.length; i += chunkSize) {
    chunks.push(campaign.messageIds.slice(i, i + chunkSize));
  }

  await Promise.all(
    chunks.map((chunk, chunkIndex) =>
      smsSendQueue.add(
        "sms-send-chunk",
        {
          campaignId: campaign.created.id,
          providerId: input.providerId,
          chunkIndex,
          messageIds: chunk,
        },
        { jobId: `sms_${campaign.created.id}_${chunkIndex}` },
      ),
    ),
  );

  return campaign.created;
}

export async function enqueueReportSync(campaignId: string, providerId: string, reportId: string) {
  await smsReportSyncQueue.add(
    "sms-report-sync",
    { campaignId, providerId, reportId },
    { jobId: `sms_report_${campaignId}` },
  );
}

export async function createIndividualSend(params: {
  userId: string;
  providerId: string;
  origin: string;
  message: string;
  numbers: string[];
}) {
  const normalized = params.numbers
    .map((n) => normalizePhone(n))
    .filter((n) => n.isValid && n.e164)
    .map((n) => n.e164 as string);
  const deduped = [...new Set(normalized)].slice(0, 10);
  const unit = 1;
  const totalCost = new Prisma.Decimal((deduped.length * unit).toFixed(4));

  const messages = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: params.userId },
      select: { smsCreditBalance: true },
    });
    if (user.smsCreditBalance.lessThan(totalCost)) {
      throw new Error("Yetersiz kredi.");
    }
    return tx.smsMessage.createManyAndReturn({
      data: deduped.map((phoneE164) => ({
        userId: params.userId,
        providerId: params.providerId,
        type: SmsMessageType.individual,
        phoneE164,
        message: params.message,
        origin: params.origin,
        status: SmsMessageStatus.queued,
        cost: unit,
      })),
    });
  });

  await applyCreditChange({
    userId: params.userId,
    type: "deduct",
    amount: totalCost.negated(),
    reason: "Bireysel SMS gonderimi",
  });

  return messages;
}
