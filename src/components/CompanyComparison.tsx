'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scale,
  Building2,
  Sparkles,
  ExternalLink,
  Flame,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { ProblemSolveModal } from './ProblemSolveModal';

const PRESET_COMPARISONS = [
  { label: 'FAANG Giants', comps: ['Google', 'Amazon', 'Meta'] },
  { label: 'Enterprise & Cloud', comps: ['Microsoft', 'Amazon', 'Google'] },
  { label: 'FinTech / High-Frequency', comps: ['Bloomberg', 'Goldman Sachs', 'Morgan Stanley'] },
  { label: 'Top Indian Tech / Mass Hiring', comps: ['TCS', 'Infosys', 'Capgemini'] },
];

export function CompanyComparison() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['Google', 'Amazon', 'Meta']);
  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [solveProblem, setSolveProblem] = useState<any>(null);

  useEffect(() => {
    async function loadComparison() {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies/compare?companies=${selectedCompanies.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setCompareData(data);
        }
      } catch (err) {
        console.error('Failed to load comparison data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (selectedCompanies.length >= 2) {
      loadComparison();
    }
  }, [selectedCompanies]);

  const handleSelectPreset = (comps: string[]) => {
    setSelectedCompanies(comps);
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header Surface */}
      <div className="data-surface p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-medium">
            Cross-Company Overlap Matrix
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Compare Target Companies & Shared Questions
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Identify common interview questions asked simultaneously across multiple top companies to maximize your preparation ROI.
        </p>

        {/* Preset Comparisons */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
          <span className="label-caps block">Popular Comparison Sets</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COMPARISONS.map((preset) => {
              const isSelected = preset.comps.join(',') === selectedCompanies.join(',');
              return (
                <button
                  key={preset.label}
                  onClick={() => handleSelectPreset(preset.comps)}
                  className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[var(--accent-green)] text-[#0e0f12] border-[var(--accent-green)] shadow-sm'
                      : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white hover:border-[var(--border-strong)]'
                  }`}
                >
                  {preset.label} ({preset.comps.join(' · ')})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-[var(--accent-green)] border-t-transparent rounded-full" />
          <p>Calculating cross-company problem overlap...</p>
        </div>
      ) : compareData ? (
        <div className="space-y-6">
          {/* Side by side comparison columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareData.overviews?.map((item: any) => (
              <div
                key={item.company}
                className="data-surface p-5 space-y-3 bg-[var(--bg-surface-raised)] border border-[var(--border-strong)]"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {item.company}
                  </h3>
                  <Link
                    href={`/company/${encodeURIComponent(item.company)}`}
                    className="text-xs text-[var(--accent-green)] hover:underline flex items-center gap-1"
                  >
                    <span>View Bank</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--diff-easy)] block">Easy</span>
                    <span className="mono font-bold text-xs text-[var(--text-primary)]">{item.stats?.easy || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--diff-medium)] block">Medium</span>
                    <span className="mono font-bold text-xs text-[var(--text-primary)]">{item.stats?.medium || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--diff-hard)] block">Hard</span>
                    <span className="mono font-bold text-xs text-[var(--text-primary)]">{item.stats?.hard || 0}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="label-caps block mb-1">Top Interview Topics</span>
                  <div className="flex flex-wrap gap-1">
                    {item.topTopics?.slice(0, 3).map((t: any, i: number) => (
                      <span key={i} className="chip bg-[var(--bg-base)] text-[10px] text-[var(--text-muted)]">
                        {t.topics.split(',')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shared Common Questions Section */}
          <div className="data-surface p-5 sm:p-6 space-y-4 border-l-4 border-l-[var(--accent-green)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="label-caps block text-[var(--accent-green)]">Maximum High-Yield Value</span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {compareData.sharedCount} Questions Asked Across All {compareData.companies?.join(', ')}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Solving these problems prepares you simultaneously for all {compareData.companies?.length} target organizations.
                </p>
              </div>
            </div>

            {compareData.sharedProblems?.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] p-4 text-center">
                No overlapping questions found across these exact selected companies.
              </p>
            ) : (
              <div className="space-y-2.5">
                {compareData.sharedProblems?.map((prob: any, idx: number) => (
                  <div
                    key={prob.slug}
                    className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] hover:border-[var(--accent-green)] transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          #{idx + 1} {prob.title}
                        </span>
                        <span className={`chip ${prob.difficulty === 'Easy' ? 'chip-easy' : prob.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                          {prob.difficulty}
                        </span>
                        <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] text-[10px] mono font-semibold">
                          Asked by {prob.comp_count} companies
                        </span>
                      </div>
                      {prob.topics && (
                        <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                          {prob.topics}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSolveProblem(prob)}
                        className="chip bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
                      >
                        Log Result
                      </button>
                      <a
                        href={prob.leetcode_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-1 px-2.5 text-xs text-[var(--accent-green)]"
                      >
                        <span>Solve</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Solve Result Modal */}
      {solveProblem && (
        <ProblemSolveModal
          isOpen={!!solveProblem}
          onClose={() => setSolveProblem(null)}
          problem={solveProblem}
        />
      )}
    </div>
  );
}
