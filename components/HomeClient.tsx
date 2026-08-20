"use client"

import { useState } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import type { RunResult, GenerateInput, ApiError, StreamEvent } from '@/lib/types';
import GenerateForm from '@/components/GenerateForm';
import LoadingCard from '@/components/LoadingCard';
import StreamingPanel from '@/components/StreamingPanel';
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
  const [streamingText, setStreamingText] = useState('');

  const handleGenerate = async (input: GenerateInput) => {
    setLoading(true);
    setError(null);
    setActiveRun(null);
    setLastInput(input);
    setStreamingText('');
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
      if (!res.body) {
        setError('The server did not return a response stream. Please try again.');
        return;
      }

      let finished = false;

      const handleLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let event: StreamEvent;
        try {
          event = JSON.parse(trimmed) as StreamEvent;
        } catch {
          return;
        }
        if (event.type === 'chunk') {
          const text = event.text;
          setStreamingText((prev) => prev + text);
        } else if (event.type === 'done') {
          const run = event.run;
          setActiveRun(run);
          setRuns((prev) => [run, ...prev].slice(0, 50));
          finished = true;
        } else if (event.type === 'error') {
          setError(event.error);
          finished = true;
        }
      };

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex >= 0) {
          handleLine(buffer.slice(0, newlineIndex));
          buffer = buffer.slice(newlineIndex + 1);
          newlineIndex = buffer.indexOf('\n');
        }
      }
      handleLine(buffer);

      if (!finished) {
        setError('The stream ended unexpectedly before the run completed. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
      setStreamingText('');
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

          {loading && (streamingText ? <StreamingPanel text={streamingText} /> : <LoadingCard />)}

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
