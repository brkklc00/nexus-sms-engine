import { Prisma, SmsCreditTransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function toDecimal(value: number | string | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

export async function applyCreditChange(params: {
  userId: string;
  type: SmsCreditTransactionType;
  amount: number | string | Prisma.Decimal;
  reason?: string;
  relatedCampaignId?: string;
  relatedMessageId?: string;
  createdById?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const amount = toDecimal(params.amount);
    const user = await tx.user.findUniqueOrThrow({
      where: { id: params.userId },
      select: { smsCreditBalance: true },
    });
    const before = user.smsCreditBalance;
    const after = before.plus(amount);
    if (after.isNegative()) {
      throw new Error("Yetersiz kredi.");
    }

    await tx.user.update({
      where: { id: params.userId },
      data: { smsCreditBalance: after },
    });

    return tx.smsCreditTransaction.create({
      data: {
        userId: params.userId,
        type: params.type,
        amount,
        balanceBefore: before,
        balanceAfter: after,
        reason: params.reason,
        relatedCampaignId: params.relatedCampaignId,
        relatedMessageId: params.relatedMessageId,
        createdById: params.createdById,
      },
    });
  });
}
