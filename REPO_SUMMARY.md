# Repository Summary: eventgroove-search-to-content-ui

> Auto-maintained by Sim Development. Last updated: 2026-08-20T13:42:12.586Z.

## Overview

Eventgroove Search to Content. Fix: /api/generate now negotiates a true SSE stream from the upstream workflow (added Accept: text/event-stream, removed the X-Sim-Stream-Protocol header so upstream emits the standard data: {"blockId","chunk"} framing shown in the observed response). The existing line parser already handles that framing, so chunks now accumulate and stream to the UI live. Files changed: app/api/generate/route.ts (upstream fetch headers only — added 'Accept': 'text/event-stream', removed 'X-Sim-Stream-Protocol'); prisma/schema.prisma echoed unchanged per database rule; app/not-found.tsx included per structure requirement (canonical, unchanged behavior).

**Repository:** `eventgroove-search-to-content-ui`  
**File count:** 35

## Features

- Keyword-to-content generation via Arena workflow pipeline
- Live streaming markdown rendering while the pipeline runs
- Article vs enrichment-plan branch detection
- Run history with select and delete
- Copy to clipboard and .md download
- Arena email gate with access-denied page

## Tech Stack

- Next.js ^15.3.3 (App Router)
- React ^19.0.0
- Tailwind CSS v3
- TypeScript
- Prisma + PostgreSQL (Neon on Vercel)

## Infrastructure

- **DATABASE_URL:** set on Vercel when Neon is connected — do not commit real credentials

## Routes & Pages

- `/` — `app/page.tsx`
- `/access-denied` — `app/access-denied/page.tsx`

## Database Models

- `Run`

## File Inventory

### App pages

- `app/access-denied/page.tsx`
- `app/arena-ds-tokens.css`
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
- `components/StreamingPanel.tsx`
- `components/arena-email-provider.tsx`

### Libraries

- `lib/actions.ts`
- `lib/arena-email-constants.ts`
- `lib/arena-email.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `prisma/schema.prisma`

### Config

- `.env.example`
- `middleware.ts`
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
- `README.md`
- `REPO_SUMMARY.md`
- `app/access-denied/page.tsx`
- `app/api/generate/route.ts`
- `app/api/history/[id]/route.ts`
- `app/api/history/route.ts`
- `app/arena-ds-tokens.css`
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
- `components/StreamingPanel.tsx`
- `components/arena-email-provider.tsx`
- `lib/actions.ts`
- `lib/arena-email-constants.ts`
- `lib/arena-email.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `middleware.ts`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `prisma/schema.prisma`
- `tailwind.config.ts`
- `tsconfig.json`

## Latest Change

- **Updated at:** 2026-08-20T13:42:12.586Z
- **Request:** Implement the following functionality in the codebase. Do not modify, refactor, remove, or "clean up" any other part of the code beyond what is explicitly listed below. Preserve existing formatting, naming conventions, comments, and logic in all unrelated sections.Changes to implement:


I am facing this issue API response render  -
Run failed
The pipeline responded but no markdown content was found in the result.
When clicking on the Generate button the API is getting hit, that I verified. But getting the above error -

Here is the response of the you need to pick the content from this -

data: {"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"#"}
data: {"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":" En"}
data: {"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"richment Plan:"}
data: {"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":" Getting Started with Event"}

data: {"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"Event Check-In and Logistics **(new)**\n  - H3: Mobile Check-In From Any Browser\n  - H3: Scanner Loans and Offline Sync\n- H2: Frequently Asked Questions **(new)**"}
data: {"event":"final","data":{"success":true,"output":{},"executionId":"f4a497d1-7603-4f2b-878b-a6a2afd7718a"}}
data: "[DONE]"


We will get the streaming response from the API, so you need to render the streaming response.

Constraints:

Only touch the files/functions directly related to the points above.
Do not change variable names, code style, or structure outside the scope of these changes.
Do not add extra features, optimizations, or refactors that weren't requested.
If a change requires touching a shared/common file, make the minimal edit needed and leave everything else untouched.
After implementing, list exactly which files and lines were changed, and why.
