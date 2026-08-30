'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, X, Terminal, ArrowUpRight, Search, Layers } from 'lucide-react';
import { CompanySummary } from '@/lib/db';

interface CompanyDirectoryProps {
  initialCompanies: CompanySummary[];
}

const ALPHABETS = [
  'ALL',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const TOP_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Bloomberg',
  'Uber', 'Adobe', 'Oracle', 'Goldman Sachs', 'ByteDance', 'Netflix',
];

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
  const sum = e + m + h || total || 1;

  const easyPct = (e / sum) * 100;
  const medPct = (m / sum) * 100;
  const hardPct = (h / sum) * 100;

  return (
    <div className="w-full h-1.5 bg-[#1a231a] flex overflow-hidden rounded-sm">
      {e > 0 && (
        <div
          style={{ width: `${easyPct}%` }}
          className="bg-[#4ade80] h-full"
        />
      )}
      {m > 0 && (
        <div
          style={{ width: `${medPct}%` }}
          className="bg-[#fbbf24] h-full"
        />
      )}
      {h > 0 && (
        <div
          style={{ width: `${hardPct}%` }}
          className="bg-[#f87171] h-full"
        />
      )}
    </div>
  );
}

export function CompanyDirectory({ initialCompanies }: CompanyDirectoryProps) {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'alpha-asc' | 'alpha-desc'>('count-desc');

  // Total deduplicated company-specific question instances
  const totalCompanyQuestions = useMemo(() => {
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
    <div className="space-y-6 font-mono text-xs text-[#4ade80] w-full">
      {/* Full-width Retro Terminal Header */}
      <div className="border border-[#233823] bg-[#151c15] p-4 sm:p-6 space-y-4 shadow-xl rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#233823] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#4ade80] font-arcade text-xs sm:text-sm">
              ★ LEETCAMP // INTERVIEW ARCHIVE & PATTERNS ★
            </span>
          </div>
          <div className="text-xs text-[#86a789] font-mono">
            SYS_STAT: [ONLINE] // {initialCompanies.length}_ORGS // 48_DSA_PATTERNS
          </div>
        </div>

        <div className="space-y-2 max-w-4xl">
          <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#4ade80] tracking-tight leading-relaxed">
            LEETCAMP — TECHNICAL INTERVIEW QUESTION ARCHIVE
          </h1>
          <p className="text-xs text-[#86a789] leading-relaxed">
            &gt; REAL-WORLD LEETCODE QUESTIONS REPORTED IN TECHNICAL INTERVIEWS ACROSS {initialCompanies.length} ORGANIZATIONS + 48 CURATED DSA TOPIC PATTERNS.
            SELECT A TARGET MODULE OR EXPLORE PATTERN ROADMAPS.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#233823]">
          <span className="px-3 py-1.5 text-xs bg-[#4ade80] text-[#111611] font-bold border border-[#4ade80] flex items-center gap-1.5 shadow-[0_0_8px_rgba(74,222,128,0.3)] rounded-sm">
            <Building2 className="w-3.5 h-3.5" />
            [COMPANY DIRECTORY ({initialCompanies.length})]
          </span>
          <Link
            href="/patterns"
            className="px-3 py-1.5 text-xs bg-[#151c15] text-[#86a789] hover:text-[#4ade80] hover:border-[#4ade80] font-bold border border-[#233823] flex items-center gap-1.5 transition-colors rounded-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            [DSA PATTERNS & ROADMAPS (48 TOPICS / 2,961+ Qs)] →
          </Link>
        </div>

        {/* Full-width Responsive Arcade Status Ribbon (BUG 1 FIX: Distinct, explicit metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">ORGANIZATIONS</span>
            <span className="font-bold text-[#4ade80] text-sm">{initialCompanies.length} COMPANIES</span>
          </div>
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">COMPANY-TRACK QUESTIONS</span>
            <span className="font-bold text-[#fbbf24] text-sm">{totalCompanyQuestions.toLocaleString()} Qs</span>
          </div>
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">UNIQUE LEETCODE CATALOG</span>
            <span className="font-bold text-[#4ade80] text-sm">3,392 PROBLEMS</span>
          </div>
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">DSA PATTERNS HUB</span>
            <span className="font-bold text-[#38bdf8] text-sm">48 TOPICS (2,961 Qs)</span>
          </div>
        </div>
      </div>

      {/* Featured / Top Companies Band (BUG 2 & BUG 3 FIX: Explicit badge boundaries & canonical stats) */}
      <div className="border border-[#2d4f2d] bg-[#151c15] p-4 sm:p-5 space-y-3.5 shadow-lg rounded-sm">
        <div className="flex items-center justify-between border-b border-[#233823] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-[11px] sm:text-xs text-[#fbbf24] flex items-center gap-1.5">
              ★ [ TOP_TRACKED_COMPANIES // HIGH_VOLUME_TARGETS ] ★
            </span>
          </div>
          <span className="text-xs text-[#86a789] hidden sm:inline font-mono">
            TIER-1 HIGH FREQUENCY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {featuredList.map((comp) => {
            return (
              <Link
                key={comp.company}
                href={`/company/${encodeURIComponent(comp.company)}`}
                className="p-3.5 border border-[#233823] bg-[#111611] hover:border-[#4ade80] hover:bg-[#1b261b] transition-all group flex flex-col justify-between space-y-2.5 shadow-sm rounded-sm"
              >
                {/* Header with clear boundary badge */}
                <div className="flex items-center justify-between gap-2 border-b border-[#233823] pb-1.5">
                  <span className="font-bold text-sm text-[#4ade80] group-hover:text-white truncate">
                    ▓ {comp.company.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-[#fbbf24] bg-[#1b261b] px-2 py-0.5 border border-[#2d4f2d] shrink-0 font-bold rounded-sm">
                    [{comp.count.toLocaleString()} Qs]
                  </span>
                </div>

                {/* Segmented difficulty bar with canonical stats */}
                <div className="space-y-1.5 pt-0.5">
                  <RatioBar
                    easy={comp.easy_count}
                    med={comp.medium_count}
                    hard={comp.hard_count}
                    total={comp.count}
                  />

                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#86a789] border-t border-[#233823]/60 font-mono">
                    <span>E:<strong className="text-[#4ade80] ml-0.5">{comp.easy_count || 0}</strong></span>
                    <span className="text-[#5e7e61]">·</span>
                    <span>M:<strong className="text-[#fbbf24] ml-0.5">{comp.medium_count || 0}</strong></span>
                    <span className="text-[#5e7e61]">·</span>
                    <span>H:<strong className="text-[#f87171] ml-0.5">{comp.hard_count || 0}</strong></span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#86a789] group-hover:text-[#4ade80] font-bold pt-1 border-t border-[#233823]">
                  &gt; [RUN] →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sticky Control Console */}
      <div className="sticky top-14 z-30 border border-[#233823] bg-[#111611]/95 backdrop-blur-md p-3 sm:p-4 space-y-3 shadow-xl rounded-sm">
        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 flex items-center bg-[#151c15] border border-[#233823] focus-within:border-[#4ade80] px-3 py-2 rounded-sm">
            <span className="text-[#4ade80] font-bold mr-2">&gt;</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH_DIRECTORY (e.g. Amazon, Google, Meta, Peak6, Dream11)..."
              className="w-full bg-transparent text-[#4ade80] placeholder-[#5e7e61] text-xs sm:text-sm focus:outline-none font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[#86a789] hover:text-[#4ade80] p-1 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#86a789] font-mono">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#151c15] border border-[#233823] text-[#4ade80] text-xs px-2.5 py-2 focus:border-[#4ade80] focus:outline-none font-mono cursor-pointer rounded-sm"
            >
              <option value="count-desc">MOST QUESTIONS (DESC)</option>
              <option value="count-asc">LEAST QUESTIONS (ASC)</option>
              <option value="alpha-asc">ALPHABETICAL (A-Z)</option>
              <option value="alpha-desc">ALPHABETICAL (Z-A)</option>
            </select>

            {(search || selectedLetter !== 'ALL' || sortBy !== 'count-desc') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs text-[#f87171] border border-[#f87171]/40 hover:bg-[#f87171] hover:text-[#111611] transition-colors font-bold font-mono rounded-sm"
              >
                [RESET]
              </button>
            )}
          </div>
        </div>

        {/* Quick Alphabet Filter Ribbon */}
        <div className="flex flex-wrap gap-1 items-center border-t border-[#233823] pt-2.5">
          <span className="text-[11px] text-[#86a789] mr-1 hidden sm:inline">ALPHA_INDEX:</span>
          {ALPHABETS.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2 py-0.5 text-xs font-mono transition-all rounded-sm ${
                  isSelected
                    ? 'bg-[#4ade80] text-[#111611] font-bold border border-[#4ade80]'
                    : 'text-[#86a789] hover:text-[#4ade80] hover:bg-[#151c15] border border-transparent'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid View (BUG 2 & BUG 3 FIX: Clear separator pills for every company) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#86a789] font-mono px-1">
          <span>MATCHING ORGANIZATIONS: <strong className="text-[#4ade80]">{filteredCompanies.length}</strong></span>
          <span>AVAILABLE FOR INSPECTION</span>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="p-12 border border-[#233823] bg-[#151c15] text-center space-y-3 rounded-sm">
            <p className="text-sm text-[#f87171] font-arcade">NO MATCHING ORGANIZATIONS FOUND</p>
            <p className="text-xs text-[#86a789]">NO MODULES MATCH QUERY: &quot;{search}&quot;</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#4ade80] text-[#111611] text-xs font-bold hover:bg-white transition-colors rounded-sm"
            >
              [RESET ALL FILTERS]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filteredCompanies.map((comp) => {
              return (
                <Link
                  key={comp.company}
                  href={`/company/${encodeURIComponent(comp.company)}`}
                  className="p-3 border border-[#233823] bg-[#151c15] hover:border-[#4ade80] hover:bg-[#1b261b] transition-all group flex flex-col justify-between space-y-2.5 shadow-sm rounded-sm"
                >
                  {/* Header: Company Name + Isolated Question Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#233823] pb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-[#4ade80] group-hover:text-white truncate">
                      {comp.company.toUpperCase()}
                    </span>
                    <span className="font-mono text-[11px] text-[#fbbf24] bg-[#111611] px-1.5 py-0.5 border border-[#233823] shrink-0 font-semibold rounded-sm">
                      [{comp.count.toLocaleString()} Qs]
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <RatioBar
                      easy={comp.easy_count}
                      med={comp.medium_count}
                      hard={comp.hard_count}
                      total={comp.count}
                    />

                    <div className="flex items-center justify-between text-[10px] text-[#86a789] pt-0.5 font-mono">
                      <span>E:<strong className="text-[#4ade80] ml-0.5">{comp.easy_count || 0}</strong></span>
                      <span className="text-[#5e7e61]">·</span>
                      <span>M:<strong className="text-[#fbbf24] ml-0.5">{comp.medium_count || 0}</strong></span>
                      <span className="text-[#5e7e61]">·</span>
                      <span>H:<strong className="text-[#f87171] ml-0.5">{comp.hard_count || 0}</strong></span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-[#86a789] group-hover:text-[#4ade80] font-bold pt-1 border-t border-[#233823]">
                    &gt; [OPEN]
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
