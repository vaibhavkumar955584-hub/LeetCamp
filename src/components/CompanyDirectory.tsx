'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { CompanySummary } from '@/lib/db';

interface CompanyDirectoryProps {
  initialCompanies: CompanySummary[];
}

const TOP_COMPANIES = [
  'Google',
  'Amazon',
  'Meta',
  'Microsoft',
  'Bloomberg',
  'Apple',
  'Uber',
  'TikTok',
  'Infosys',
  'Goldman Sachs',
  'Oracle',
  'Salesforce',
];

const ALPHABETS = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

interface RatioBarProps {
  easy?: number;
  med?: number;
  hard?: number;
  total: number;
}

function RatioBar({ easy = 0, med = 0, hard = 0, total }: RatioBarProps) {
  const e = easy || 0;
  const m = med || 0;
  const h = hard || 0;
  const tot = total || e + m + h;

  if (tot <= 0) {
    return (
      <div className="w-full h-1.5 bg-[#142013] border border-[#1a2e1a] overflow-hidden" />
    );
  }

  const easyPct = ((e / tot) * 100).toFixed(1);
  const medPct = ((m / tot) * 100).toFixed(1);
  const hardPct = ((h / tot) * 100).toFixed(1);

  return (
    <div
      className="w-full h-1.5 bg-[#142013] border border-[#1a2e1a] flex overflow-hidden"
      title={`Easy: ${e} (${easyPct}%), Med: ${m} (${medPct}%), Hard: ${h} (${hardPct}%)`}
    >
      {e > 0 && (
        <div
          style={{ width: `${easyPct}%` }}
          className="bg-[#33ff66] h-full"
        />
      )}
      {m > 0 && (
        <div
          style={{ width: `${medPct}%` }}
          className="bg-[#ffb000] h-full"
        />
      )}
      {h > 0 && (
        <div
          style={{ width: `${hardPct}%` }}
          className="bg-[#ff3b3b] h-full"
        />
      )}
    </div>
  );
}

export function CompanyDirectory({ initialCompanies }: CompanyDirectoryProps) {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'alpha-asc' | 'alpha-desc'>('count-desc');

  const totalQuestions = useMemo(() => {
    return initialCompanies.reduce((acc, c) => acc + c.count, 0);
  }, [initialCompanies]);

  // Curated Featured Companies list
  const featuredList = useMemo(() => {
    return TOP_COMPANIES.map((name) =>
      initialCompanies.find((c) => c.company.toLowerCase() === name.toLowerCase())
    ).filter(Boolean) as CompanySummary[];
  }, [initialCompanies]);

  // Filtered companies for the full directory
  const filteredCompanies = useMemo(() => {
    return initialCompanies
      .filter((item) => {
        // Search filter
        if (search.trim()) {
          const s = search.toLowerCase().trim();
          if (!item.company.toLowerCase().includes(s)) {
            return false;
          }
        }

        // Letter filter
        if (selectedLetter !== 'ALL') {
          const firstChar = item.company.charAt(0).toUpperCase();
          if (firstChar !== selectedLetter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'count-desc') return b.count - a.count;
        if (sortBy === 'count-asc') return a.count - b.count;
        if (sortBy === 'alpha-asc') return a.company.localeCompare(b.company);
        if (sortBy === 'alpha-desc') return b.company.localeCompare(a.company);
        return 0;
      });
  }, [initialCompanies, search, selectedLetter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedLetter('ALL');
    setSortBy('count-desc');
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#33ff66] w-full">
      {/* Full-width Retro Terminal Arcade Header */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a2e1a] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#33ff66] font-arcade text-xs sm:text-sm">
              ★ LEETCAMP // INTERVIEW LEADERBOARD ★
            </span>
          </div>
          <div className="text-xs text-[#62ad6a] font-mono">
            SYS_STAT: [ONLINE] // {initialCompanies.length}_ORGS // {totalQuestions.toLocaleString()}_RECORDS
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#33ff66] tracking-tight leading-relaxed">
            LEETCAMP — TECHNICAL INTERVIEW QUESTION ARCHIVE
          </h1>
          <p className="text-xs text-[#62ad6a] max-w-4xl leading-relaxed">
            &gt; REAL-WORLD LEETCODE QUESTIONS REPORTED IN TECHNICAL INTERVIEWS ACROSS 429+ ORGANIZATIONS.
            SELECT A TARGET MODULE TO INSPECT HIGH-SCORE QUESTIONS.
          </p>
        </div>

        {/* Full-width Responsive Arcade Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">ORGANIZATIONS: </span>
            <span className="font-bold text-[#33ff66] text-sm">{initialCompanies.length}</span>
          </div>
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">INDEXED_PROBLEMS: </span>
            <span className="font-bold text-[#33ff66] text-sm">{totalQuestions.toLocaleString()}</span>
          </div>
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">TARGET_SYSTEM: </span>
            <span className="font-bold text-[#33ff66]">LEETCODE.COM</span>
          </div>
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">DATA_ENGINE: </span>
            <span className="font-bold text-[#33ff66]">SQLITE3 [WAL]</span>
          </div>
        </div>
      </div>

      {/* Featured / Top Companies Band */}
      <div className="border border-[#2d4f2d] bg-[#0b0f0a] p-4 sm:p-5 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#1a2e1a] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-[11px] sm:text-xs text-[#ffb000] flex items-center gap-1.5">
              ★ [ TOP_TRACKED_COMPANIES // HIGH_VOLUME_TARGETS ] ★
            </span>
          </div>
          <span className="text-xs text-[#62ad6a] hidden sm:inline font-mono">
            TIER-1 HIGH FREQUENCY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {featuredList.map((comp) => {
            return (
              <Link
                key={comp.company}
                href={`/company/${encodeURIComponent(comp.company)}`}
                className="p-3.5 border border-[#2d4f2d] bg-[#0f170e] hover:border-[#33ff66] hover:bg-[#142013] transition-all group flex flex-col justify-between space-y-2.5 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-1 border-b border-[#1a2e1a] pb-1.5">
                  <span className="font-bold text-sm text-[#33ff66] group-hover:text-white truncate">
                    ▓ {comp.company.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-[#ffb000] bg-[#162e19] px-2 py-0.5 border border-[#2d4f2d] shrink-0 font-bold">
                    {comp.count} <span className="text-[10px] text-[#62ad6a]">Qs</span>
                  </span>
                </div>

                {/* Segmented difficulty bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#62ad6a]">DISTRIBUTION:</span>
                    <span className="text-[#33ff66] font-bold">
                      {comp.count} TOTAL
                    </span>
                  </div>

                  <RatioBar
                    easy={comp.easy_count}
                    med={comp.medium_count}
                    hard={comp.hard_count}
                    total={comp.count}
                  />

                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#62ad6a] border-t border-[#1a2e1a]/60 font-mono">
                    <span>E:<strong className="text-[#33ff66] ml-0.5">{comp.easy_count || 0}</strong></span>
                    <span>M:<strong className="text-[#ffb000] ml-0.5">{comp.medium_count || 0}</strong></span>
                    <span>H:<strong className="text-[#ff3b3b] ml-0.5">{comp.hard_count || 0}</strong></span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#62ad6a] group-hover:text-[#33ff66] font-bold pt-1 border-t border-[#1a2e1a]">
                  &gt; [RUN] →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sticky Control Console */}
      <div className="sticky top-14 z-30 border border-[#1a2e1a] bg-[#0b0f0a]/95 backdrop-blur-md p-3 sm:p-4 space-y-3 shadow-xl">
        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 flex items-center bg-[#0f170e] border border-[#1a2e1a] focus-within:border-[#33ff66] px-3 py-2">
            <span className="text-[#33ff66] font-bold mr-2">&gt;</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH_BY_NAME: Google, Infosys, Amazon, Meta, Microsoft..."
              className="w-full bg-transparent text-[#33ff66] placeholder-[#62ad6a] text-xs sm:text-sm focus:outline-none font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[#62ad6a] hover:text-[#33ff66] ml-2"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#62ad6a] uppercase font-bold">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0f170e] border border-[#1a2e1a] focus:border-[#33ff66] text-[#33ff66] text-xs px-2.5 py-2 cursor-pointer font-mono outline-none"
            >
              <option value="count-desc">HIGH_SCORE (QUESTIONS ▼)</option>
              <option value="count-asc">LOW_SCORE (QUESTIONS ▲)</option>
              <option value="alpha-asc">NAME (A → Z)</option>
              <option value="alpha-desc">NAME (Z → A)</option>
            </select>
          </div>
        </div>

        {/* Alphabet Jump Bar with Horizontal Touch Scroll on Mobile */}
        <div className="pt-2 border-t border-[#1a2e1a] overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="inline-flex items-center gap-1">
            <span className="text-xs text-[#62ad6a] mr-1 select-none font-bold">FILTER_LETTER:</span>
            {ALPHABETS.map((letter) => {
              const active = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-2 py-1 text-xs font-mono transition-colors ${
                    active
                      ? 'bg-[#33ff66] text-[#0b0f0a] font-bold'
                      : 'text-[#62ad6a] hover:text-[#33ff66] hover:bg-[#162e19]'
                  }`}
                >
                  [{letter}]
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(search || selectedLetter !== 'ALL' || sortBy !== 'count-desc') && (
          <div className="flex items-center justify-between pt-2 border-t border-[#1a2e1a] text-xs text-[#62ad6a]">
            <div>
              ACTIVE_FILTERS: {search && `SEARCH="${search}" `} {selectedLetter !== 'ALL' && `LETTER=[${selectedLetter}] `}
            </div>
            <button
              onClick={clearFilters}
              className="text-[#33ff66] hover:underline font-bold"
            >
              [RESET_ALL]
            </button>
          </div>
        )}
      </div>

      {/* Section Header for Full Directory */}
      <div className="flex items-center justify-between text-xs text-[#62ad6a] px-1 border-b border-[#1a2e1a] pb-2 font-mono">
        <span className="font-bold text-[#33ff66]">
          [ ALL_ORGANIZATIONS_INDEX // DISPLAYING {filteredCompanies.length} MODULES ]
        </span>
        <span className="text-[#62ad6a]">
          {filteredCompanies.length === initialCompanies.length
            ? 'ALL RECORDS ACTIVE'
            : `FILTERED ${filteredCompanies.length} OF ${initialCompanies.length}`}
        </span>
      </div>

      {/* Full Responsive Company Grid (Direct CSS Grid - No Virtualization Offset Glitches) */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filteredCompanies.map((c) => {
            const isTier1 = c.count >= 500;

            return (
              <Link
                key={c.company}
                href={`/company/${encodeURIComponent(c.company)}`}
                className={`p-3.5 border bg-[#0b0f0a] hover:border-[#33ff66] hover:bg-[#0f170e] transition-all group flex flex-col justify-between space-y-2.5 ${
                  isTier1 ? 'border-[#2d4f2d]' : 'border-[#1a2e1a]'
                }`}
              >
                {/* Title Bar */}
                <div className="flex items-start justify-between gap-1.5 border-b border-[#1a2e1a] pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#33ff66] group-hover:text-white font-bold text-sm truncate">
                      ▓ {c.company.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isTier1 && (
                      <span className="text-[9px] text-[#ffb000] border border-[#ffb000]/40 px-1 py-0.2 hidden sm:inline font-mono">
                        ★ 500+
                      </span>
                    )}
                    <span className="font-mono text-xs text-[#33ff66] bg-[#162e19] px-2 py-0.5 border border-[#2d4f2d] font-bold">
                      {c.count} <span className="text-[10px] text-[#62ad6a]">Qs</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Ratio */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#62ad6a] text-[11px] font-mono">
                    <span>DIFFICULTY RATIO:</span>
                  </div>

                  <RatioBar
                    easy={c.easy_count}
                    med={c.medium_count}
                    hard={c.hard_count}
                    total={c.count}
                  />

                  {/* Breakdown Counts */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1a2e1a]/60 text-[#62ad6a] font-mono">
                    <span className="text-[#33ff66]">
                      E:<strong className="text-white ml-0.5">{c.easy_count || 0}</strong>
                    </span>
                    <span className="text-[#ffb000]">
                      M:<strong className="text-white ml-0.5">{c.medium_count || 0}</strong>
                    </span>
                    <span className="text-[#ff3b3b]">
                      H:<strong className="text-white ml-0.5">{c.hard_count || 0}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Link */}
                <div className="text-right pt-1 border-t border-[#1a2e1a] text-xs text-[#62ad6a] group-hover:text-[#33ff66] font-bold">
                  &gt; [INSPECT] →
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border border-[#1a2e1a] bg-[#0b0f0a] text-center space-y-3">
          <div className="font-arcade text-xs text-[#ff3b3b]">
            [!] NO MATCHING RECORDS FOUND
          </div>
          <p className="text-xs text-[#62ad6a]">
            NO ORGANIZATIONS MATCHED YOUR QUERY &quot;{search}&quot;.
          </p>
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 bg-[#162e19] border border-[#2d4f2d] text-[#33ff66] text-xs hover:bg-[#33ff66] hover:text-[#0b0f0a] font-bold"
          >
            [RESET_FILTERS]
          </button>
        </div>
      )}
    </div>
  );
}
