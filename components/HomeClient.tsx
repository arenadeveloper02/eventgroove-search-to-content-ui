"use client"

import { useState } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import type { RunResult, GenerateInput, ApiError } from '@/lib/types';
import GenerateForm from '@/components/GenerateForm';
import LoadingCard from '@/components/LoadingCard';
import ResultPanel from '@/components/ResultPanel';
import HistorySidebar from '@/components/HistorySidebar';

interface HomeClientProps {
  initialRuns: RunResult[];
}

export default function HomeClient({ initialRuns }: HomeClientProps) {
  const [runs, setRuns] = useState<RunResult[]>(initialRuns);
  const [activeRun, setActiveRun] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null);

  const handleGenerate = async (input: GenerateInput) => {
    setLoading(true);
    setError(null);
    setActiveRun(null);
    setLastInput(input);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        let message = 'The generation run failed. Please try again.';
        try {
          const data = (await res.json()) as ApiError;
          if (data.error) message = data.error;
        } catch {
          // keep the default message
        }
        setError(message);
        return;
      }
      const run = (await res.json()) as RunResult;
      setActiveRun(run);
      setRuns((prev) => [run, ...prev].slice(0, 50));
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRuns((prev) => prev.filter((r) => r.id !== id));
        setActiveRun((prev) => (prev && prev.id === id ? null : prev));
      }
    } catch {
      // deletion failed silently; the item stays in the list
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      void handleGenerate(lastInput);
    } else {
      setError(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Eventgroove Search to Content
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Turn a keyword into an SEO article draft or an enrichment plan.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <GenerateForm disabled={loading} onGenerate={handleGenerate} />

          {loading && <LoadingCard />}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Run failed</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && activeRun && <ResultPanel run={activeRun} />}

          {!loading && !error && !activeRun && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No result yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Enter a keyword above and hit Generate, or pick a past run from the history.
              </p>
            </div>
          )}
        </div>

        <HistorySidebar
          runs={runs}
          activeId={activeRun ? activeRun.id : null}
          onSelect={(run) => {
            setActiveRun(run);
            setError(null);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
