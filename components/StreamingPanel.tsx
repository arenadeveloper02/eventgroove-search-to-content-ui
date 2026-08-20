"use client"

import { Loader2 } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface StreamingPanelProps {
  text: string;
}

export default function StreamingPanel({ text }: StreamingPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
        <span className="text-sm font-semibold text-navy">Generating\u2026</span>
        <span className="text-xs text-slate-400">Content is streaming in live below.</span>
      </div>
      <div className="px-6 py-6 sm:px-8">
        <MarkdownRenderer markdown={text} />
        <div className="mt-4 h-4 w-24 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
