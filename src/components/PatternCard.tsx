import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PatternSummary } from '@/lib/db';

interface PatternCardProps {
  pattern: PatternSummary;
  solvedCount?: number;
}

export default function PatternCard({ pattern, solvedCount = 0 }: PatternCardProps) {
  const { category, slug, group, count, basic_count = 0, easy_count = 0, medium_count = 0, hard_count = 0, avg_accuracy } = pattern;
  const total = basic_count + easy_count + medium_count + hard_count || count || 1;

  const basicPct = (basic_count / total) * 100;
  const easyPct = (easy_count / total) * 100;
  const mediumPct = (medium_count / total) * 100;
  const hardPct = (hard_count / total) * 100;

  return (
    <Link
      href={`/patterns/${slug}`}
      className="data-surface group flex flex-col justify-between gap-3 p-4 hover:border-[var(--accent-green)] transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="label-caps block mb-0.5">
            {group}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] group-hover:text-white truncate">
            {category}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mono mt-0.5">
            {count.toLocaleString()} problems
          </p>
        </div>
        <ArrowUpRight
          size={16}
          className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5"
        />
      </div>

      {/* Difficulty distribution bar */}
      <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-[var(--bg-hover)]">
        {basic_count > 0 && <div style={{ width: `${basicPct}%` }} className="bg-[var(--diff-basic)] h-full" />}
        {easy_count > 0 && <div style={{ width: `${easyPct}%` }} className="bg-[var(--diff-easy)] h-full" />}
        {medium_count > 0 && <div style={{ width: `${mediumPct}%` }} className="bg-[var(--diff-medium)] h-full" />}
        {hard_count > 0 && <div style={{ width: `${hardPct}%` }} className="bg-[var(--diff-hard)] h-full" />}
      </div>

      {/* Difficulty chips & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-xs">
        <div className="flex flex-wrap gap-1">
          {basic_count > 0 && <span className="chip chip-basic">{basic_count} Basic</span>}
          <span className="chip chip-easy">{easy_count} Easy</span>
          <span className="chip chip-medium">{medium_count} Med</span>
          <span className="chip chip-hard">{hard_count} Hard</span>
        </div>

        {avg_accuracy && (
          <span className="text-[11px] mono text-[var(--text-muted)] font-medium">
            {avg_accuracy}% acc
          </span>
        )}
      </div>

      {solvedCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--accent-green)] font-medium pt-1 border-t border-[var(--border-subtle)]">
          <CheckCircle2 size={13} />
          <span>Solved {solvedCount}/{count}</span>
        </div>
      )}
    </Link>
  );
}
