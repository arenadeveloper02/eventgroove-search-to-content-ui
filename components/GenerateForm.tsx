"use client"

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { GenerateInput } from '@/lib/types';

interface GenerateFormProps {
  disabled: boolean;
  onGenerate: (input: GenerateInput) => void;
}

export default function GenerateForm({ disabled, onGenerate }: GenerateFormProps) {
  const [keyword, setKeyword] = useState('');
  const [intent, setIntent] = useState('Informational');
  const [client, setClient] = useState('Eventgroove');
  const [site, setSite] = useState('https://products.eventgroove.com/');

  const canSubmit = !disabled && keyword.trim().length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate({
      keyword: keyword.trim(),
      intent: intent.trim() || 'Informational',
      client: client.trim() || 'Eventgroove',
      site: site.trim() || 'https://products.eventgroove.com/',
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-slate-400';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="keyword" className="mb-1.5 block text-sm font-medium text-navy">
            Keyword <span className="text-primary-600">*</span>
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. school fundraising ideas"
            autoFocus
            required
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="intent" className="mb-1.5 block text-sm font-medium text-navy">
            Intent
          </label>
          <input
            id="intent"
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="client" className="mb-1.5 block text-sm font-medium text-navy">
            Client
          </label>
          <input
            id="client"
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="site" className="mb-1.5 block text-sm font-medium text-navy">
            Site
          </label>
          <input
            id="site"
            type="text"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {disabled ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </form>
  );
}
