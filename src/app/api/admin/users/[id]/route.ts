import { requireAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { parseJson } from "@/lib/validate";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const schema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  role: z.enum(["admin", "customer"]).optional(),
  isActive: z.boolean().optional(),
  smsMarkupPercent: z.number().min(0).max(500).optional(),
  defaultProviderId: z.string().nullable().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      smsCreditBalance: true,
      smsMarkupPercent: true,
      defaultProviderId: true,
      defaultProvider: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return fail("Kullanıcı bulunamadı.", 404);
  return ok(user);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        smsCreditBalance: true,
        smsMarkupPercent: true,
        defaultProviderId: true,
        updatedAt: true,
      },
    });
    await writeAuditLog({
      userId: auth.user.id,
      action: "USER_UPDATE",
      entityType: "User",
      entityId: user.id,
      metadata: parsed.data,
    });
    return ok(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("Bu e-posta adresi zaten kullanımda.", 409);
    }
    return fail("Kullanıcı güncellenemedi.", 500);
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  return PUT(req, context);
}

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = await parseJson(req, resetPasswordSchema);
  if ("error" in parsed) return parsed.error;

  const user = await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
    select: { id: true, email: true },
  });
  await prisma.session.deleteMany({ where: { userId: id } });
  await writeAuditLog({
    userId: auth.user.id,
    action: "USER_RESET_PASSWORD",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });
  return ok({ id: user.id, reset: true });
}
