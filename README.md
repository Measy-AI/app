# MeasyAI Next.js App (Mäisi EY EI)

Production-ready Next.js App Router starter built from your landing page with:

- Tailwind CSS migration
- Better Auth email/password auth
- Stripe Checkout billing
- Vercel AI SDK chat endpoint + UI (via OpenRouter)
- Drizzle ORM with Turso (libsql)

## 1) Install

```bash
bun install
```

## 2) Configure env

```bash
cp .env.example .env
```

Fill all required variables, especially:

- `DATABASE_TURSO_DATABASE_URL`
- `DATABASE_TURSO_AUTH_TOKEN`
- `TURSO_ACCOUNT_ID` and `TURSO_DATABASE_ID` (for Drizzle migrations against Turso)
- `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated, include your Vercel app URL)
- `OPENROUTER_API_KEY`
- `AI_MODEL_FREE`
- `AI_MODEL_PRO`

`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are supported as legacy fallback names.
`DATABASE_URL` is kept as a local fallback for dev-only SQLite.

## 3) Setup database

```bash
bun run db:generate
bun run db:migrate
```

## 4) Run

```bash
bun run dev
```

## Included routes

- `/` marketing landing page
- `/login` sign in page
- `/register` sign up page
- `/buy` Stripe checkout page
- `/dashboard` authenticated dashboard with AI chat
- `/api/chat` Vercel AI SDK route (OpenRouter)
- `/api/checkout` creates Stripe Checkout session
- `/api/stripe/webhook` handles Stripe events
- `/api/auth/[...all]` Better Auth handler
