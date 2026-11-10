import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ensureDb, sql } from "@/lib/db";

export const SESSION_COOKIE = "pp_session";
const SESSION_DAYS = 7;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

/** Attach the session cookie to a NextResponse. */
export async function setSessionCookie(response, userId) {
  const token = await createSessionToken(userId);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

/** Returns the logged-in user ({id, email, name, is_pro}) or null. */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let userId;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    userId = Number(payload.sub);
  } catch {
    return null;
  }
  if (!Number.isInteger(userId)) return null;
  await ensureDb();
  const rows = await sql`SELECT id, email, name, is_pro FROM users WHERE id = ${userId}`;
  return rows[0] ?? null;
}

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
