'use server';

import { prisma } from '@/lib/prisma';
import type { RunResult, Branch } from '@/lib/types';

function toBranch(value: string): Branch {
  return value === 'enrichment' ? 'enrichment' : 'article';
}

export async function getHistory(): Promise<RunResult[]> {
  try {
    const runs = await prisma.run.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return runs.map((r) => ({
      id: r.id,
      keyword: r.keyword,
      branch: toBranch(r.branch),
      markdown: r.markdown,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function deleteRun(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.run.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: 'Run not found' };
  }
}
