import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { fail, ok } from "@/lib/http";
import { getImpersonationState, clearImpersonationCookie } from "@/lib/impersonation";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return fail("Oturum gerekli.", 401);

  const impersonation = await getImpersonationState();
  if (!impersonation?.active) return fail("Aktif impersonation bulunamadı.", 422);
  if (sessionUser.id !== impersonation.adminId) return fail("Sadece başlatan admin dönüş yapabilir.", 403);

  await writeAuditLog({
    userId: sessionUser.id,
    action: "IMPERSONATION_STOP",
    entityType: "User",
    entityId: impersonation.targetUserId,
    metadata: {
      targetUserId: impersonation.targetUserId,
      targetUserEmail: impersonation.targetUserEmail,
      startedAt: impersonation.startedAt,
    },
  });

  const response = ok({ redirectTo: "/admin/dashboard" }) as NextResponse;
  clearImpersonationCookie(response);
  return response;
}
