import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

// Public demo account required by the assignment. It is intentionally not a secret.
export const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "password123!";

export const FREE_PLAN_LIMIT = 3;

let client;
export function sql(strings, ...values) {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Add your Neon connection string.");
    }
    client = neon(process.env.DATABASE_URL);
  }
  return client(strings, ...values);
}

let ready;
/** Creates tables (if missing) and guarantees the demo account exists with paid access. */
export function ensureDb() {
  if (!ready) {
    ready = init().catch((err) => {
      ready = undefined;
      throw err;
    });
  }
  return ready;
}

async function init() {
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

  const rows = await sql`SELECT id, password_hash, is_pro FROM users WHERE email = ${DEMO_EMAIL}`;
  if (rows.length === 0) {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await sql`
      INSERT INTO users (email, name, password_hash, is_pro)
      VALUES (${DEMO_EMAIL}, 'Demo Student', ${hash}, TRUE)
      ON CONFLICT (email) DO NOTHING`;
  } else {
    const demo = rows[0];
    const passwordOk = await bcrypt.compare(DEMO_PASSWORD, demo.password_hash);
    if (!demo.is_pro || !passwordOk) {
      const hash = passwordOk ? demo.password_hash : await bcrypt.hash(DEMO_PASSWORD, 10);
      await sql`UPDATE users SET is_pro = TRUE, password_hash = ${hash} WHERE id = ${demo.id}`;
    }
  }
}
