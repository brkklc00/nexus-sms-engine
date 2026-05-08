import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getImpersonationState } from "@/lib/impersonation";

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: UserRole;
  impersonation?: {
    active: true;
    adminId: string;
    adminEmail: string;
    targetUserId: string;
    targetUserEmail: string;
    startedAt: string;
  };
};

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user as AppUser;
}

export async function getCurrentUser() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const impersonation = await getImpersonationState();
  if (
    impersonation &&
    (sessionUser.role ?? UserRole.customer) === UserRole.admin &&
    sessionUser.id === impersonation.adminId
  ) {
    const targetUser = await prisma.user.findUnique({
      where: { id: impersonation.targetUserId },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (targetUser && targetUser.isActive && targetUser.role === UserRole.customer) {
      return {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        impersonation,
      } satisfies AppUser;
    }
  }

  return sessionUser;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Oturum gerekli." } },
        { status: 401 },
      ),
    };
  }
  return { user };
}

export async function requireUser() {
  return requireApiUser();
}

export async function requireRealAdmin() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return {
      error: NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Oturum gerekli." } },
        { status: 401 },
      ),
    };
  }
  if ((sessionUser.role ?? UserRole.customer) !== UserRole.admin) {
    return {
      error: NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } },
        { status: 403 },
      ),
    };
  }
  return { user: sessionUser };
}

export async function requireAdmin() {
  const base = await requireApiUser();
  if ("error" in base) return base;
  if (base.user.impersonation?.active) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          error: {
            code: "IMPERSONATION_ACTIVE",
            message: "Önce admine dönmelisiniz.",
          },
        },
        { status: 403 },
      ),
    };
  }
  if ((base.user.role ?? UserRole.customer) !== UserRole.admin) {
    return {
      error: NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Yetkisiz." } },
        { status: 403 },
      ),
    };
  }
  return base;
}
