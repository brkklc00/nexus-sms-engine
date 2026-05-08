import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/api-auth";
import { fail, ok, parsePagination } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";
import { applyCreditChange } from "@/modules/sms/credit.service";
import { Prisma } from "@prisma/client";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["admin", "customer"]).default("customer"),
  isActive: z.boolean().default(true),
  initialCredit: z.number().min(0).default(0),
  smsMarkupPercent: z.number().min(0).max(500).default(0),
  defaultProviderId: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const { limit, page, skip } = parsePagination(url);
  const q = url.searchParams.get("q")?.trim();
  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        smsCreditBalance: true,
        smsMarkupPercent: true,
        defaultProvider: { select: { id: true, name: true } },
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return ok({ items, total, page, limit });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = await parseJson(req, createSchema);
  if ("error" in parsed) return parsed.error;
  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        name: parsed.data.name,
        role: parsed.data.role,
        isActive: parsed.data.isActive,
        smsMarkupPercent: parsed.data.smsMarkupPercent,
        defaultProviderId: parsed.data.defaultProviderId ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        smsCreditBalance: true,
        smsMarkupPercent: true,
        defaultProviderId: true,
        createdAt: true,
      },
    });

    if (parsed.data.initialCredit > 0) {
      await applyCreditChange({
        userId: user.id,
        type: "add",
        amount: parsed.data.initialCredit,
        reason: "Başlangıç kredisi",
        createdById: auth.user.id,
      });
    }

    await writeAuditLog({
      userId: auth.user.id,
      action: "USER_CREATE",
      entityType: "User",
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        initialCredit: parsed.data.initialCredit,
      },
    });
    return ok(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("Bu e-posta adresi zaten kullanımda.", 409);
    }
    return fail("Kullanıcı oluşturulamadı.", 500);
  }
}
