import { ok } from "@/lib/http";
import { getCurrentUser, getSessionUser } from "@/lib/api-auth";

export async function GET() {
  const [sessionUser, currentUser] = await Promise.all([getSessionUser(), getCurrentUser()]);
  if (!sessionUser || !currentUser) return ok({ active: false });
  if (!currentUser.impersonation?.active) return ok({ active: false });

  return ok({
    active: true,
    adminId: currentUser.impersonation.adminId,
    adminEmail: currentUser.impersonation.adminEmail,
    targetUserId: currentUser.impersonation.targetUserId,
    targetUserEmail: currentUser.impersonation.targetUserEmail,
    startedAt: currentUser.impersonation.startedAt,
  });
}
