import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "recoverybuddy_session";
const SESSION_LIFETIME_SECONDS = 60 * 60;

export type RecoverySession = {
  userId: string;
  issuer: "mock-minddistrict";
  subject: string;
  minddistrictTenant: string;
  minddistrictPatientId: string;
  displayName: string;
  role: "patient";
  issuedAt: number;
  expiresAt: number;
};

function secret() {
  const value = process.env.MOCK_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MOCK_SESSION_SECRET must contain at least 32 characters");
  }
  return "development-only-secret-change-me-123456789";
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(encodedPayload: string) {
  return createHmac("sha256", secret()).update(encodedPayload).digest("base64url");
}

export function createSessionValue(
  input: Omit<RecoverySession, "issuedAt" | "expiresAt">,
  now = Date.now(),
) {
  const payload: RecoverySession = {
    ...input,
    issuedAt: now,
    expiresAt: now + SESSION_LIFETIME_SECONDS * 1000,
  };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionValue(value: string, now = Date.now()): RecoverySession | null {
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as RecoverySession;
    if (
      parsed.issuer !== "mock-minddistrict" ||
      parsed.role !== "patient" ||
      !parsed.userId ||
      !parsed.subject ||
      !parsed.minddistrictPatientId ||
      parsed.expiresAt <= now
    ) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return value ? verifySessionValue(value) : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_LIFETIME_SECONDS,
};
