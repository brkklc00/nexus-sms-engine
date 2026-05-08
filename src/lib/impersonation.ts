import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "nexus_impersonation";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 saat

export type ImpersonationPayload = {
  active: true;
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  startedAt: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signBody(encodedBody: string) {
  return createHmac("sha256", getSecret()).update(encodedBody).digest("base64url");
}

export function createSignedImpersonation(payload: ImpersonationPayload) {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = signBody(body);
  return `${body}.${signature}`;
}

export function verifySignedImpersonation(value: string | null | undefined): ImpersonationPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = signBody(body);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(body)) as ImpersonationPayload;
    if (!parsed?.active || !parsed.adminId || !parsed.targetUserId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getImpersonationState() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  return verifySignedImpersonation(raw);
}

export function setImpersonationCookie(response: Response, payload: ImpersonationPayload) {
  // NextResponse, Response tipini genişletiyor; runtime'da cookies alanı var.
  (response as Response & { cookies?: { set: (...args: unknown[]) => void } }).cookies?.set({
    name: COOKIE_NAME,
    value: createSignedImpersonation(payload),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearImpersonationCookie(response: Response) {
  (response as Response & { cookies?: { set: (...args: unknown[]) => void } }).cookies?.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
