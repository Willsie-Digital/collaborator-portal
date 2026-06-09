# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **Endless Era Collaborator Portal** is a Next.js + TypeScript web application for official Endless Era collaborators (streamers, content creators). It enables collaborators to:
- Browse and apply for sponsorship and event opportunities
- Access learning resources for growth and self-promotion (applicable to all content creator types, not just streamers)
- Upload and host portfolio assets (demo reels, contact sheets, media kits)

Deployed on **Vercel**.

## Next.js Version Note

This project uses **Next.js 16**, which has breaking changes from older versions. APIs, conventions, and file structure may differ from training data. Before writing Next.js-specific code, consult the relevant guide in `node_modules/next/dist/docs/`.

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Run all tests
npm test

# Run a single test file
npx vitest run path/to/test.ts

# Run tests in watch mode
npm run test:watch
```

## Architecture

This is a **Next.js App Router** application with TypeScript. All routes live under `app/`, using server components by default and client components where interactivity is needed.

### Key areas

- `app/` — App Router pages, layouts, and API routes (`app/api/`)
- `components/` — Shared UI components
- `lib/` — Utility functions, API clients, and server-side helpers
- `public/` — Static assets

### Auth

**Auth.js v5** with Discord OAuth and the Prisma adapter. Key files:
- `auth.config.ts` — edge-compatible config (providers + callbacks, no DB imports). Used by the proxy.
- `auth.ts` — full config with PrismaAdapter. Used by API routes and server components.
- `proxy.ts` — Next.js 16 proxy (replaces `middleware.ts`). Runs in the Edge Runtime using `auth.config.ts` only — never import Prisma here.
- `app/api/auth/[...nextauth]/route.ts` — Auth.js route handler.

Session strategy is JWT (required when using the Prisma adapter with edge proxy). Access the session server-side via `auth()` from `@/auth`.

Discord OAuth credentials (`AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`) come from the Discord Developer Portal. The redirect URI to register is `<domain>/api/auth/callback/discord`. Generate `AUTH_SECRET` with `npx auth secret`.

### Data & Auth

- Authentication will gate all portal features — collaborators must be verified Endless Era members
- Portfolio assets (video, images, PDFs) require external file storage — use Vercel Blob, S3, or Cloudinary (never local disk)

### Vercel deployment

- Vercel auto-detects Next.js — no config file needed for standard deployments
- Pushes to `main` deploy to production automatically via GitHub integration
- Every PR gets a preview deployment URL
- All secrets and environment variables go in the Vercel dashboard (never in `.env` committed to the repo)
- API routes run as serverless functions — no long-running background processes or persistent WebSocket connections

## Security (OWASP)

All code must follow OWASP Top 10 principles. Key rules for this stack:

- **Input validation** — validate and sanitize all user input server-side in API routes; never trust client-supplied data
- **Injection** — use parameterized queries for all database access; never concatenate user input into queries or shell commands
- **Auth & access control** — every API route and page that handles user data must verify session/auth; use Next.js middleware for route-level protection
- **Secrets** — secrets live in Vercel environment variables only; never hardcode or expose them in client bundles (`NEXT_PUBLIC_` prefix only for truly public values)
- **XSS** — avoid `dangerouslySetInnerHTML`; if required, sanitize with a library like `DOMPurify` first
- **Security headers** — configured in `next.config.ts`; the CSP `unsafe-inline`/`unsafe-eval` directives should be tightened as the app matures
- **Dependencies** — run `npm audit` regularly; do not ignore high/critical findings
- **File uploads** — validate MIME type and file size server-side before passing to storage; never execute uploaded files
- **CSRF** — Next.js Server Actions include built-in CSRF protection; for custom API routes use `SameSite` cookies and verify `Origin`/`Referer` headers

`eslint-plugin-security` is enabled and will flag common issues at lint time.

## Database

**Neon PostgreSQL** via **Prisma 7**. The schema lives in `prisma/schema.prisma`. The generated client is output to `app/generated/prisma/` (gitignored — regenerate after schema changes). Always import Prisma through the singleton at `lib/prisma.ts`, never instantiate `PrismaClient` directly.

Prisma 7 no longer supports `url`/`directUrl` in `schema.prisma` — connection URLs live only in `prisma.config.ts` (for the CLI/migrations) and are passed via the `PrismaNeon` adapter in `lib/prisma.ts` (for the app). The client uses the Neon serverless driver (`@prisma/adapter-neon`) which works over WebSockets — required for Vercel's serverless environment.

Neon provides two connection strings — set both in `.env` (locally) and in Vercel environment variables (production):
- `DATABASE_URL` — pooled connection via PgBouncer (used by the app at runtime)
- `DIRECT_URL` — direct connection (used by Prisma CLI/migrations via `prisma.config.ts`)

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply pending migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Push schema changes without a migration file (prototyping only)
npx prisma db push
```

## Environment Variables

Document new env vars here as they are added:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string (runtime queries) |
| `DIRECT_URL` | Neon direct connection string (migrations only) |
| `AUTH_SECRET` | Auth.js secret — generate with `npx auth secret` |
| `AUTH_DISCORD_ID` | Discord OAuth client ID |
| `AUTH_DISCORD_SECRET` | Discord OAuth client secret |
