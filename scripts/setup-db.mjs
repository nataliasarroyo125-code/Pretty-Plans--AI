// Creates the database tables and the demo account (demo@demo.com / password123!, Pro access).
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local)
// The app also does this automatically on first request, so this script is optional.
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT,
    password_hash TEXT NOT NULL,
    is_pro        BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_session_id TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS plans (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL,
    title      TEXT NOT NULL,
    input      JSONB NOT NULL,
    result     TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
await sql`CREATE INDEX IF NOT EXISTS plans_user_id_idx ON plans(user_id, created_at DESC)`;

const hash = await bcrypt.hash("password123!", 10);
await sql`
  INSERT INTO users (email, name, password_hash, is_pro)
  VALUES ('demo@demo.com', 'Demo Student', ${hash}, TRUE)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_pro = TRUE`;

const [demo] = await sql`SELECT id, email, is_pro FROM users WHERE email = 'demo@demo.com'`;
console.log("Database ready. Demo account:", demo);
