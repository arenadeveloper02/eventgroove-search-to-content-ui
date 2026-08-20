# Eventgroove Search to Content

Internal SEO content tool for Eventgroove. Enter a seed keyword and the existing AI pipeline returns either a full SEO article draft or an enrichment plan for an existing article, rendered as beautiful markdown with copy/download support and a persisted run history.

## Features

- Keyword form with prefilled intent, client, and site fields
- Server-side proxy (`POST /api/generate`) that keeps `SIM_API_KEY` secret, with a 300-second timeout
- Defensive markdown extraction and branch detection (New Article Draft vs Enrichment Plan)
- Rendered markdown via react-markdown + remark-gfm + rehype-raw (raw HTML tables supported)
- Copy to clipboard and Download `.md` with slugified filename
- Run history stored in Neon Postgres via Prisma, with per-item delete

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 with @tailwindcss/typography
- Prisma + Neon Postgres

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` — Neon Postgres connection string
   - `SIM_API_KEY` — server-only API key for the pipeline (never exposed to the browser)
3. `npm run dev`

## Build & deploy

`npm run build` runs `prisma generate && prisma db push && next build`. On Vercel, connect a Neon database (injects `DATABASE_URL`) and add `SIM_API_KEY` as an environment variable.
