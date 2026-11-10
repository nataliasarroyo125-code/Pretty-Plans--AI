import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDb, sql } from "@/lib/db";
import { normalizeEmail, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  try {
    await ensureDb();
    const rows = await sql`SELECT id, password_hash FROM users WHERE email = ${email}`;
    const user = rows[0];
    const ok = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!ok) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    return await setSessionCookie(response, user.id);
  } catch (err) {
    console.error("login failed", err);
    return NextResponse.json({ error: "Could not log you in. Please try again." }, { status: 500 });
  }
}
