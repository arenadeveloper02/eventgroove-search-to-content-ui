import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Branch } from '@/lib/types';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const UPSTREAM_URL =
  'https://agent.thearena.ai/api/workflows/e2662cbd-8abd-4d08-bc58-26c23536d57f/execute';

const FALLBACK_API_KEY = 'sk-sim-rUVbZxIl5c-Lmv8l58W0HQfJFY0Z_dBf';

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
    ['content'],
    ['data', 'content'],
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

// Fallback recovery: scan the entire raw upstream body for every
// "chunk":"..." JSON string value and reassemble the streamed markdown.
// This handles SSE framings that line-by-line parsing missed (e.g. unusual
// line terminators or frames split across reads).
function extractChunksFromRaw(raw: string): string {
  const regex = /"chunk"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let out = '';
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    try {
      out += JSON.parse(`"${match[1]}"`) as string;
    } catch {
      // skip malformed chunk escape sequences
    }
  }
  return out;
}

interface ParsedStreamLine {
  chunk?: string;
  finalPayload?: unknown;
}

function parseStreamLine(line: string): ParsedStreamLine | null {
  let trimmed = line.trim();
  if (!trimmed) return null;
  // Skip non-data SSE fields entirely.
  if (trimmed.startsWith('event:') || trimmed.startsWith('id:') || trimmed.startsWith('retry:')) {
    return null;
  }
  if (trimmed.startsWith('data:')) trimmed = trimmed.slice(5).trim();
  if (!trimmed) return null;
  // Done markers arrive in several shapes: [DONE], "[DONE]", [[DONE]], "[[DONE]]".
  if (
    trimmed === '[DONE]' ||
    trimmed === '"[DONE]"' ||
    trimmed === '[[DONE]]' ||
    trimmed === '"[[DONE]]"'
  ) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (parsed !== null && typeof parsed === 'object') {
    const rec = parsed as Record<string, unknown>;
    if (typeof rec.chunk === 'string') return { chunk: rec.chunk };
    // Some frames nest the chunk under a data object: {"data":{"chunk":"..."}}
    const nested = rec.data;
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      const nestedRec = nested as Record<string, unknown>;
      if (typeof nestedRec.chunk === 'string' && rec.event !== 'final') {
        return { chunk: nestedRec.chunk };
      }
    }
    if (typeof rec.content === 'string' && rec.content.trim().length > 0) {
      return { finalPayload: rec };
    }
    if (rec.event === 'final') return { finalPayload: rec.data ?? rec };
  }
  return null;
}

export async function POST(request: Request): Promise<Response> {
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

  const apiKey = process.env.SIM_API_KEY && process.env.SIM_API_KEY.trim()
    ? process.env.SIM_API_KEY.trim()
    : FALLBACK_API_KEY;

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-Sim-Stream-Protocol': 'agent-events-v1',
      },
      body: JSON.stringify({
        keyword,
        intent,
        client,
        site,
        stream: true,
        selectedOutputs: ['articleenricher.content'],
        includeThinking: true,
        includeToolCalls: true,
      }),
      signal: AbortSignal.timeout(300_000),
      cache: 'no-store',
    });
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

  const upstreamBody = upstream.body;
  if (!upstream.ok || !upstreamBody) {
    return NextResponse.json(
      { error: `The content pipeline returned an error (status ${upstream.status}). Please try again.` },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      let markdown = '';
      let finalPayload: unknown = undefined;
      let rawText = '';

      const handleLine = (line: string) => {
        const parsed = parseStreamLine(line);
        if (!parsed) return;
        if (typeof parsed.chunk === 'string') {
          markdown += parsed.chunk;
          send({ type: 'chunk', text: parsed.chunk });
        }
        if (parsed.finalPayload !== undefined) {
          finalPayload = parsed.finalPayload;
        }
      };

      const reader = upstreamBody.getReader();
      try {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          buffer += text;
          rawText += text;
          // SSE frames may be terminated by \n, \r\n, or \r — split on any of them.
          let newlineIndex = buffer.search(/[\r\n]/);
          while (newlineIndex >= 0) {
            handleLine(buffer.slice(0, newlineIndex));
            buffer = buffer.slice(newlineIndex + 1);
            newlineIndex = buffer.search(/[\r\n]/);
          }
        }
        handleLine(buffer);

        if (!markdown.trim() && finalPayload !== undefined) {
          const extracted = extractMarkdown(finalPayload);
          if (extracted.trim()) {
            markdown = extracted;
            send({ type: 'chunk', text: extracted });
          }
        }

        if (!markdown.trim() && rawText.trim()) {
          // Recover streamed chunks directly from the raw body when line-by-line
          // parsing produced nothing (e.g. unexpected framing of the SSE stream).
          const rawChunks = extractChunksFromRaw(rawText);
          if (rawChunks.trim()) {
            markdown = rawChunks;
            send({ type: 'chunk', text: rawChunks });
          }
        }

        if (!markdown.trim() && rawText.trim()) {
          // The upstream may return a single (possibly pretty-printed) JSON document
          // instead of newline-delimited stream events. Parse the whole body and
          // extract the markdown content from it.
          try {
            const wholePayload: unknown = JSON.parse(rawText.trim());
            const extracted = extractMarkdown(wholePayload);
            if (extracted.trim()) {
              markdown = extracted;
              send({ type: 'chunk', text: extracted });
            }
          } catch {
            // rawText was not a single JSON document; nothing more to extract
          }
        }

        if (!markdown.trim()) {
          send({
            type: 'error',
            error: 'The pipeline responded but no markdown content was found in the result.',
          });
          return;
        }

        const branch: Branch = markdown.trim().toLowerCase().startsWith('# enrichment plan')
          ? 'enrichment'
          : 'article';

        try {
          const run = await prisma.run.create({
            data: { keyword, intent, client, site, branch, markdown },
          });
          send({
            type: 'done',
            run: {
              id: run.id,
              keyword,
              branch,
              markdown,
              createdAt: run.createdAt.toISOString(),
            },
          });
        } catch {
          send({
            type: 'error',
            error: 'The run succeeded but could not be saved to the database.',
          });
        }
      } catch (err) {
        const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
        send({
          type: 'error',
          error: isTimeout
            ? 'The pipeline run timed out after 5 minutes. Please try again.'
            : 'The stream from the content pipeline was interrupted. Please try again.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
