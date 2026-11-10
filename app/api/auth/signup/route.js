import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDb, sql } from "@/lib/db";
import { isValidEmail, normalizeEmail, setSessionCookie } from "@/lib/auth";

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
  const name = String(body.name ?? "").trim().slice(0, 80);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Password must be 8–128 characters." }, { status: 400 });
  }

  try {
    await ensureDb();
    const hash = await bcrypt.hash(password, 10);
    const rows = await sql`
      INSERT INTO users (email, name, password_hash)
      VALUES (${email}, ${name || null}, ${hash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id`;
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "An account with that email already exists. Try logging in." },
        { status: 409 }
      );
    }
    const response = NextResponse.json({ ok: true });
    return await setSessionCookie(response, rows[0].id);
  } catch (err) {
    console.error("signup failed", err);
    return NextResponse.json({ error: "Could not create your account. Please try again." }, { status: 500 });
  }
}
