"use client"

import { Trash2, History } from 'lucide-react';
import type { RunResult } from '@/lib/types';
import BranchBadge from '@/components/BranchBadge';

interface HistorySidebarProps {
  runs: RunResult[];
  activeId: string | null;
  onSelect: (run: RunResult) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function HistorySidebar({ runs, activeId, onSelect, onDelete }: HistorySidebarProps) {
  return (
    <aside className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <History className="h-4 w-4 text-primary-600" />
        <h2 className="text-sm font-semibold text-navy">History</h2>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-slate-500">
          {runs.length}
        </span>
      </div>
      {runs.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium text-slate-500">No runs yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Generate your first draft and it will show up here.
          </p>
        </div>
      ) : (
        <ul className="max-h-[32rem] divide-y divide-gray-100 overflow-y-auto">
          {runs.map((run) => (
            <li key={run.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(run)}
                className={`block w-full px-5 py-3.5 text-left transition hover:bg-primary-50/50 ${
                  activeId === run.id ? 'bg-primary-50' : ''
                }`}
              >
                <p className="truncate pr-8 text-sm font-medium text-navy">{run.keyword}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <BranchBadge branch={run.branch} />
                  <span className="text-xs text-slate-400">
                    {formatRelativeTime(run.createdAt)}
                  </span>
                </div>
              </button>
              <button
                type="button"
                aria-label={`Delete run for ${run.keyword}`}
                onClick={() => onDelete(run.id)}
                className="absolute right-3 top-3 rounded-md p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
