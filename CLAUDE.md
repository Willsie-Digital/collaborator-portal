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

### Data & Auth

- Authentication will gate all portal features — collaborators must be verified Endless Era members
- Portfolio assets (video, images, PDFs) require external file storage — use Vercel Blob, S3, or Cloudinary (never local disk)

### Vercel deployment

- Vercel auto-detects Next.js — no config file needed for standard deployments
- Pushes to `main` deploy to production automatically via GitHub integration
- Every PR gets a preview deployment URL
- All secrets and environment variables go in the Vercel dashboard (never in `.env` committed to the repo)
- API routes run as serverless functions — no long-running background processes or persistent WebSocket connections

## Environment Variables

Document new env vars here as they are added:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Primary database connection string |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `NEXTAUTH_URL` | Canonical app URL (set to Vercel production URL) |
