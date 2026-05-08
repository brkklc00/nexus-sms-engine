import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireRealAdmin } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getImpersonationState, setImpersonationCookie } from "@/lib/impersonation";
import { writeAuditLog } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRealAdmin();
  if ("error" in auth) return auth.error;
  const activeState = await getImpersonationState();
  if (activeState?.active) return fail("Önce mevcut impersonation oturumunu sonlandırın.", 422);

  const { id } = await params;
  if (auth.user.id === id) return fail("Kendi hesabınıza geçiş yapamazsınız.", 422);

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, isActive: true },
  });
  if (!target) return fail("Kullanıcı bulunamadı.", 404);
  if (!target.isActive) return fail("Pasif kullanıcıya geçiş yapılamaz.", 422);
  if (target.role !== UserRole.customer) return fail("Sadece müşteri hesaplarına geçiş yapılabilir.", 422);

  await writeAuditLog({
    userId: auth.user.id,
    action: "IMPERSONATION_START",
    entityType: "User",
    entityId: target.id,
    metadata: { targetUserId: target.id, targetUserEmail: target.email },
  });

  const response = ok({ redirectTo: "/dashboard" }) as NextResponse;
  setImpersonationCookie(response, {
    active: true,
    adminId: auth.user.id,
    adminEmail: auth.user.email ?? "",
    targetUserId: target.id,
    targetUserEmail: target.email,
    startedAt: new Date().toISOString(),
  });
  return response;
}
