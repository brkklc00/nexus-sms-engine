import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function getCurrentUser() {
  return getSessionUser();
}

export async function requireApiUser() {
  const user = await getSessionUser();
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

export async function requireAdmin() {
  const base = await requireApiUser();
  if ("error" in base) return base;
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
