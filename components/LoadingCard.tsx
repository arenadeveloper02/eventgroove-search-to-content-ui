"use client"

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingCard() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy">
            Researching keywords, checking existing Eventgroove content, and generating your
            draft… this usually takes 1-3 minutes.
          </p>
          <p className="mt-1 text-xs text-slate-400">Elapsed: {elapsed}s</p>
          <div className="mt-5 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
