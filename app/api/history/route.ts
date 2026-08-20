import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const runs = await prisma.run.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(
      runs.map((r) => ({
        id: r.id,
        keyword: r.keyword,
        branch: r.branch === 'enrichment' ? 'enrichment' : 'article',
        markdown: r.markdown,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Could not load history.' }, { status: 500 });
  }
}
