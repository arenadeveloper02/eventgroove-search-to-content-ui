import type { Branch } from '@/lib/types';

interface BranchBadgeProps {
  branch: Branch;
}

export default function BranchBadge({ branch }: BranchBadgeProps) {
  if (branch === 'enrichment') {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
        Enrichment Plan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      New Article Draft
    </span>
  );
}
