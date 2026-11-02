# InternTrack

Internship application tracking with Next.js, Better Auth, and Neon PostgreSQL.

## Local setup

Install dependencies with `pnpm install`. Create an ignored `.env.local` in the project root:

```env
DATABASE_URL="your Neon PostgreSQL connection URL"
BETTER_AUTH_SECRET="a randomly generated secret of at least 32 characters"
BETTER_AUTH_URL="http://localhost:3000"
```

Never commit this file. Generate the secret with a password manager or Node's cryptographic random generator. Use the Neon connection's TLS settings.

Run `pnpm db:migrate`, then `pnpm dev`. Open http://localhost:3000 and create an account. The migration creates Better Auth's user, account, session, verification, and rate-limit tables plus the application's `applications` table. It is safe to rerun for the current schema; it does not drop existing tables.

## What works

- Signup, login, logout, hashed passwords, database-backed sessions, and persistent auth rate limits.
- A protected dashboard with application creation, editing, deletion, search, status filters, deadlines, and JSON export.
- Every application belongs to one account. Server-side ownership checks protect reads and mutations.
- Application data survives logout and is accessible from other browsers after login.
- Empty accounts start empty; fictional sample applications are not inserted into real accounts.

Email verification is currently disabled. Password reset emails are not configured yet. Existing browser-only demo data is not automatically imported into an account; it remains in the browser's original localStorage.

## Deployment

In Vercel, connect Neon to the project, then configure:

- `DATABASE_URL`: supplied by the Neon integration. Verify this exact variable name exists; do not expose it with a NEXT_PUBLIC prefix.
- `BETTER_AUTH_SECRET`: a random secret of at least 32 characters.
- `BETTER_AUTH_URL`: `https://intern-track-inky.vercel.app` for Production. Use the exact preview deployment origin for Preview; do not point previews at production auth.

Apply `pnpm db:migrate` to the intended database before deployment. For Neon preview branches, migrations must also be applied there before using the preview. The project does not automatically run migrations during builds. Redeploy after changing environment settings.

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm build
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.browsers"
pnpm exec playwright install chromium
pnpm test:e2e
```

Browser tests run against a production build at localhost:3000 and the configured database. They create clearly labeled automated test accounts under example.com, not real user accounts for submission evidence. Use a development database branch for repeated tests. Tests cover desktop/mobile CRUD, cross-browser login persistence, logout, wrong passwords, and authenticated/unauthenticated attempts to mutate another user's records.

## Remaining assignment features

Resume uploads and AI matching against user-added job descriptions, interview scheduling, Stripe billing, the pre-created paid demo account, and the final submission document are not implemented yet. These should not be represented as live functionality until configured and tested.
