# Repository Summary: Eventgroove Search to Content

> Auto-maintained by Sim Development. Last updated: 2026-08-20T10:25:12.013Z.

## Overview

Internal SEO content tool UI for Eventgroove: turn a seed keyword into a full SEO article draft or an enrichment plan via an existing AI pipeline, with beautiful markdown rendering, run history, copy/download, and a secure server-side proxy to the pipeline API.

**Repository:** `eventgroove-search-to-content-ui`  
**File count:** 29

## Features

- Keyword form with prefilled intent, client, and site fields
- Server-side proxy API route that keeps SIM_API_KEY secret with 300s timeout
- Defensive markdown extraction from the pipeline response with branch detection
- Rendered markdown via react-markdown + remark-gfm + rehype-raw with Tailwind typography
- Copy to clipboard and Download .md with slugified filename
- Run history persisted in Neon Postgres via Prisma with delete support
- Loading state with elapsed-seconds counter, error and empty states

## Tech Stack

- Next.js ^15.3.3 (App Router)
- React ^19.0.0
- Tailwind CSS v3
- TypeScript
- Prisma + PostgreSQL (Neon on Vercel)

## Infrastructure

- **Neon project ID:** `aged-snow-04932374` — managed by Sim Development; do not delete or replace
- **DATABASE_URL:** set on Vercel when Neon is connected — do not commit real credentials

## Routes & Pages

- `/` — `app/page.tsx`

## Database Models

- `Run`

## File Inventory

### App pages

- `app/error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/page.tsx`

### API routes

- `app/api/generate/route.ts`
- `app/api/history/[id]/route.ts`
- `app/api/history/route.ts`

### Components

- `components/BranchBadge.tsx`
- `components/GenerateForm.tsx`
- `components/HistorySidebar.tsx`
- `components/HomeClient.tsx`
- `components/LoadingCard.tsx`
- `components/MarkdownRenderer.tsx`
- `components/ResultPanel.tsx`

### Libraries

- `lib/actions.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `prisma/schema.prisma`

### Config

- `.env.example`
- `.gitignore`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`

### Other

- `README.md`
- `REPO_SUMMARY.md`

## Complete File Index

- `.env.example`
- `.gitignore`
- `README.md`
- `REPO_SUMMARY.md`
- `app/api/generate/route.ts`
- `app/api/history/[id]/route.ts`
- `app/api/history/route.ts`
- `app/error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/page.tsx`
- `components/BranchBadge.tsx`
- `components/GenerateForm.tsx`
- `components/HistorySidebar.tsx`
- `components/HomeClient.tsx`
- `components/LoadingCard.tsx`
- `components/MarkdownRenderer.tsx`
- `components/ResultPanel.tsx`
- `lib/actions.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `prisma/schema.prisma`
- `tailwind.config.ts`
- `tsconfig.json`

## Latest Change

- **Updated at:** 2026-08-20T10:25:12.013Z
- **Request:** Build a Next.js App Router app called "Eventgroove Search to Content" — an internal SEO content tool UI for Eventgroove.

PURPOSE
It is a front-end for an existing AI pipeline that takes a seed keyword and returns EITHER a full SEO article draft (markdown) OR an enrichment plan for an existing article (markdown).

PAGES / UI
1. Single main page (/) with a clean, centered layout:
   - Header: "Eventgroove Search to Content" with a short subtitle: "Turn a keyword into an SEO article draft or an enrichment plan."
   - A form card with four fields:
     * keyword — text input, required, empty by default, placeholder "e.g. school fundraising ideas", autofocus.
     * intent — text input, prefilled with "Informational", editable.
     * client — text input, prefilled with "Eventgroove", editable.
     * site — text input, prefilled with "https://products.eventgroove.com/", editable.
   - A primary "Generate" submit button, disabled while a run is in flight and when keyword is empty.
2. Loading state: while the run is in flight show an animated skeleton/spinner card with the message "Researching keywords, checking existing Eventgroove content, and generating your draft… this usually takes 1-3 minutes." plus an elapsed-seconds counter. Do not block the whole page; keep the form visible but disabled.
3. Result panel: when the run returns, render the returned markdown beautifully using react-markdown with remark-gfm and Tailwind typography (prose) styling. Support headings, nested lists, bold, links, and raw HTML tables (use rehype-raw so the <table> markup the pipeline emits renders correctly, styled with borders and padding).
   - Above the rendered markdown show a small result header with the keyword, the run timestamp, and a badge showing the branch: "New Article Draft" (green) or "Enrichment Plan" (blue).
   - Two buttons: "Copy to clipboard" (copies the raw markdown, shows a transient "Copied!" confirmation) and "Download .md" (downloads the markdown as <slugified-keyword>.md).
4. History sidebar / section: a list of past runs, newest first, showing keyword, relative timestamp, and branch badge. Clicking a history item loads that run's markdown into the result panel. Include a small delete (trash) button per item. Show an empty state when there is no history yet.
5. Error state: if the run fails or times out, show a red error card with the message and a "Try again" button. Never show a raw stack trace.

BACKEND / API
- Create a server-side Next.js API route POST /api/generate that acts as a proxy. It must:
  * Read the request body { keyword, intent, client, site }.
  * POST to https://agent.thearena.ai/api/workflows/e2662cbd-8abd-4d08-bc58-26c23536d57f/execute with headers { "Content-Type": "application/json", "X-API-Key": process.env.SIM_API_KEY } and body { "keyword": ..., "intent": ..., "client": ..., "site": ... }.
  * NEVER expose SIM_API_KEY to the client. It is a server-only env var. Do not prefix it with NEXT_PUBLIC_. If SIM_API_KEY is missing, return a clear 500 JSON error "SIM_API_KEY is not configured on the server".
  * Set a long timeout (at least 300 seconds) and configure the route with `export const maxDuration = 300;` and `export const dynamic = 'force-dynamic';` because the pipeline is slow.
  * The upstream response is a JSON object whose output contains the pipeline result. Extract the markdown defensively: walk the response looking for the first non-empty string on any of these paths in order — output.content, output.articleWriter.content, output.articleEnricher.content, output.result.content, data.output.content — and fall back to a deep search for the longest string value that looks like markdown (starts with '#' or contains '\n## '). Determine the branch: if the markdown starts with "# Enrichment Plan" (case-insensitive) treat branch as "enrichment", otherwise "article".
  * Persist the run to the database, then return { markdown, branch, keyword, createdAt, id } to the client.
- Create GET /api/history (returns the 50 most recent runs, newest first) and DELETE /api/history/[id].

DATABASE (Neon Postgres + Prisma)
- One Prisma model `Run` with: id (cuid, primary key), keyword (String), intent (String), client (String), site (String), branch (String), markdown (String @db.Text), createdAt (DateTime @default(now())), updatedAt (DateTime @updatedAt). Do NOT omit updatedAt.
- Use a singleton Prisma client in lib/prisma.ts.

STYLING
- Tailwind CSS with @tailwindcss/typography. Clean, modern, professional SaaS look appropriate for Eventgroove (event ticketing and fundraising): white/very-light-gray background, generous whitespace, rounded-xl cards with subtle shadow and thin borders, a confident teal/green primary accent (#0F9D8C-ish) with a deeper navy for headings, and Inter or system font stack. Fully responsive — history collapses below the main panel on mobile. Include a small footer noting "Internal tool — Eventgroove SEO content pipeline".

QUALITY
- TypeScript throughout, no `any` in exported signatures.
- Proper loading/error/empty states everywhere; no placeholder or lorem-ipsum copy.
- Make sure the app builds cleanly with `next build`.
