# Pretty Plans AI

A personalized AI planning app for students and young adults — organize schedules, plan events, and design your room around your budget and style.

**Created by Natalia Arroyo** · Build & Ship With AI, Week 2 · Live: https://pretty-plans-ai.vercel.app/

## Features

- **Homepage** explaining the product, features, and pricing
- **Sign up / log in** with accounts stored in **Neon Postgres** (bcrypt-hashed passwords, signed HTTP-only session cookie)
- **AI planner** for events, room/space design, and schedules, powered by the **Claude API** (called server-side only)
- **Stripe Checkout** (test mode) — one-time $9.99 upgrade to Pro (unlimited plans; free accounts get 3)
- **Demo account:** `demo@demo.com` / `password123!` with full Pro access (created automatically)

## Tech stack

Next.js 15 (App Router) · Neon serverless Postgres · Anthropic SDK (`claude-opus-5-5`) · Stripe · deployed on Vercel

## Environment variables

Copy `.env.example` to `.env.local` for local development. In production, set them in **Vercel → Settings → Environment Variables**. Secrets are never committed (see `.gitignore`).

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Random 64-char hex string for signing sessions |
| `ANTHROPIC_API_KEY` | Claude API key |
| `STRIPE_SECRET_KEY` | Stripe test secret key (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Optional; Stripe webhook signing secret (`whsec_…`) |

## Local development

```bash
npm install
npm run db:setup   # optional — tables and demo user are also created automatically
npm run dev        # http://localhost:3000
```

## Stripe test payment

Use card `4242 4242 4242 4242`, any future expiry date, any CVC, any ZIP.

## Previous version

The original Week 1 static landing page is still in this repository as the root `index.html` (Next.js ignores it) and in the git history.
