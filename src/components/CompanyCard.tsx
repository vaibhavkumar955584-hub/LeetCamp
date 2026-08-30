import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CompanyCardProps {
  name: string;
  totalQuestions: number;
  easy?: number;
  medium?: number;
  hard?: number;
}

/**
 * Replaces the old single-string card:
 *   "GOOGLE 2344 Qs DISTRIBUTION:2344 TOTAL E:616 M:1223 H:505 > [RUN] →"
 *
 * With clear visual hierarchy: name -> total -> difficulty chips -> action.
 * No ALL-CAPS forced, no bracket/ASCII decoration, no scanline overlay.
 */
export default function CompanyCard({
  name,
  totalQuestions,
  easy = 0,
  medium = 0,
  hard = 0,
}: CompanyCardProps) {
  const total = easy + medium + hard || totalQuestions || 1; // guard divide-by-zero
  const easyPct = (easy / total) * 100;
  const mediumPct = (medium / total) * 100;
  const hardPct = (hard / total) * 100;

  return (
    <Link
      href={`/company/${encodeURIComponent(name)}`}
      className="data-surface group flex flex-col justify-between gap-3 p-4 hover:border-[var(--accent-green)] transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] group-hover:text-white truncate">
            {name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mono mt-0.5">
            {totalQuestions.toLocaleString()} questions
          </p>
        </div>
        <ArrowUpRight
          size={16}
          className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5"
        />
      </div>

      {/* Difficulty distribution bar */}
      <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-[var(--bg-hover)]">
        {easy > 0 && <div style={{ width: `${easyPct}%` }} className="bg-[var(--diff-easy)] h-full" />}
        {medium > 0 && <div style={{ width: `${mediumPct}%` }} className="bg-[var(--diff-medium)] h-full" />}
        {hard > 0 && <div style={{ width: `${hardPct}%` }} className="bg-[var(--diff-hard)] h-full" />}
      </div>

      {/* Difficulty chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="chip chip-easy">{easy} Easy</span>
        <span className="chip chip-medium">{medium} Med</span>
        <span className="chip chip-hard">{hard} Hard</span>
      </div>
    </Link>
  );
}
