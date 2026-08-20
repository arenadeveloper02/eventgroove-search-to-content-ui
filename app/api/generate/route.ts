import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Branch } from '@/lib/types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const UPSTREAM_URL =
  'https://agent.thearena.ai/api/workflows/e2662cbd-8abd-4d08-bc58-26c23536d57f/execute';

function isMarkdownLike(s: string): boolean {
  const trimmed = s.trim();
  return trimmed.startsWith('#') || trimmed.includes('\n## ');
}

function getPath(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current !== null && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function findLongestMarkdown(value: unknown, seen: Set<object> = new Set()): string {
  if (typeof value === 'string') {
    return isMarkdownLike(value) ? value : '';
  }
  if (value !== null && typeof value === 'object') {
    if (seen.has(value as object)) return '';
    seen.add(value as object);
    let best = '';
    const values = Array.isArray(value)
      ? value
      : Object.values(value as Record<string, unknown>);
    for (const v of values) {
      const candidate = findLongestMarkdown(v, seen);
      if (candidate.length > best.length) best = candidate;
    }
    return best;
  }
  return '';
}

function extractMarkdown(payload: unknown): string {
  const paths: string[][] = [
    ['output', 'content'],
    ['output', 'articleWriter', 'content'],
    ['output', 'articleEnricher', 'content'],
    ['output', 'result', 'content'],
    ['data', 'output', 'content'],
  ];
  for (const path of paths) {
    const value = getPath(payload, path);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return findLongestMarkdown(payload);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const keyword = typeof record.keyword === 'string' ? record.keyword.trim() : '';
  const intent = typeof record.intent === 'string' && record.intent.trim() ? record.intent.trim() : 'Informational';
  const client = typeof record.client === 'string' && record.client.trim() ? record.client.trim() : 'Eventgroove';
  const site = typeof record.site === 'string' && record.site.trim() ? record.site.trim() : 'https://products.eventgroove.com/';

  if (!keyword) {
    return NextResponse.json({ error: 'A keyword is required.' }, { status: 400 });
  }

  const apiKey = process.env.SIM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'SIM_API_KEY is not configured on the server' },
      { status: 500 }
    );
  }

  let upstreamJson: unknown;
  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ keyword, intent, client, site }),
      signal: AbortSignal.timeout(300_000),
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `The content pipeline returned an error (status ${upstream.status}). Please try again.` },
        { status: 502 }
      );
    }

    upstreamJson = await upstream.json();
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return NextResponse.json(
      {
        error: isTimeout
          ? 'The pipeline run timed out after 5 minutes. Please try again.'
          : 'Could not reach the content pipeline. Please try again.',
      },
      { status: 502 }
    );
  }

  const markdown = extractMarkdown(upstreamJson);
  if (!markdown || markdown.trim().length === 0) {
    return NextResponse.json(
      { error: 'The pipeline responded but no markdown content was found in the result.' },
      { status: 502 }
    );
  }

  const branch: Branch = markdown.trim().toLowerCase().startsWith('# enrichment plan')
    ? 'enrichment'
    : 'article';

  try {
    const run = await prisma.run.create({
      data: { keyword, intent, client, site, branch, markdown },
    });
    return NextResponse.json({
      id: run.id,
      markdown,
      branch,
      keyword,
      createdAt: run.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'The run succeeded but could not be saved to the database.' },
      { status: 500 }
    );
  }
}
