# Repository Summary: eventgroove-search-to-content-ui

> Auto-maintained by Sim Development. Last updated: 2026-08-20T11:33:10.746Z.

## Overview

Eventgroove Search to Content — turn a keyword into an SEO article draft or an enrichment plan with live streaming output from the Arena workflow pipeline.

**Repository:** `eventgroove-search-to-content-ui`  
**File count:** 35

## Features

- Keyword-to-content generation form
- Live streaming of pipeline output as it is generated
- Markdown rendering of article drafts and enrichment plans
- Run history with select and delete
- Copy to clipboard and download as .md

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

- **Updated at:** 2026-08-20T11:33:10.746Z
- **Request:** Implement the following functionality in the codebase. Do not modify, refactor, remove, or "clean up" any other part of the code beyond what is explicitly listed below. Preserve existing formatting, naming conventions, comments, and logic in all unrelated sections.Changes to implement:
After populating all the mandatory fields in the Form when user click on 'Generate' button, hit this API -
curl -X POST \ -H "X-API-Key: sk-sim-rUVbZxIl5c-Lmv8l58W0HQfJFY0Z_dBf" \ -H "X-Sim-Stream-Protocol: agent-events-v1" \ -H "Content-Type: application/json" \ -d '{"keyword":"example","intent":"example","client":"example","site":"example","stream":true,"selectedOutputs":["articleenricher.content"],"includeThinking":true,"includeToolCalls":true}' \ https://agent.thearena.ai/api/workflows/e2662cbd-8abd-4d08-bc58-26c23536d57f/execute

Map the input values into the payload.

Here is a sample streaming response -
"
[[DONE]]
"
16:52:20
{"event":"final","data":{"success":true,"output":{},"executionId":"f4a497d1-7603-4f2b-878b-a6a2afd7718a"}}
16:52:20
{"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"ly to fundraising ticketing, school event ticketing, or church event registration, despite these being core Eventgroove audiences and secondary keyword targets.\n- **Print"}
16:51:50
{"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"Event Check-In and Logistics (new)\n - H3: Mobile Check-In From Any Browser\n - H3: Scanner Loans and Offline Sync\n- H2: Frequently Asked Questions (new)"}
16:52:17
{"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"ove"}
16:51:43
{"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":"ing\n\n**Target"}
16:51:43
{"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":" Ticket"}
16:51:42
{"blockId":"0b2e41c4-15db-49e2-96f4-0d9aaebf4beb","chunk":" Getting Started with Event"}
16:51:42
{
    "blockId": "0b2e41c4-15db-49e2-96f4-0d9aaebf4beb",
    "chunk": " Getting Started with Event"
}
