'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { X, Layers, Building2, Flame } from 'lucide-react';
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
              ★ LEETCAMP // INTERVIEW ARCHIVE & PATTERNS ★
            </span>
          </div>
          <div className="text-xs text-[#62ad6a] font-mono">
            SYS_STAT: [ONLINE] // {initialCompanies.length}_ORGS // 48_DSA_PATTERNS
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#33ff66] tracking-tight leading-relaxed">
            LEETCAMP — TECHNICAL INTERVIEW QUESTION ARCHIVE
          </h1>
          <p className="text-xs text-[#62ad6a] max-w-4xl leading-relaxed">
            &gt; REAL-WORLD LEETCODE QUESTIONS REPORTED IN TECHNICAL INTERVIEWS ACROSS 470+ ORGANIZATIONS + 48 CURATED DSA PATTERNS.
            SELECT A TARGET MODULE OR EXPLORE PATTERN ROADMAPS.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#1a2e1a]">
          <span className="px-3 py-1.5 text-xs bg-[#33ff66] text-[#0b0f0a] font-bold border border-[#33ff66] flex items-center gap-1.5 shadow-[0_0_8px_rgba(51,255,102,0.4)]">
            <Building2 className="w-3.5 h-3.5" />
            [COMPANY DIRECTORY ({initialCompanies.length})]
          </span>
          <Link
            href="/patterns"
            className="px-3 py-1.5 text-xs bg-[#0f170e] text-[#62ad6a] hover:text-[#33ff66] hover:border-[#33ff66] font-bold border border-[#1a2e1a] flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            [DSA PATTERNS & ROADMAPS (48 TOPICS / 2,961+ Qs)] →
          </Link>
        </div>

        {/* Full-width Responsive Arcade Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">ORGANIZATIONS: </span>
            <span className="font-bold text-[#33ff66] text-sm">{initialCompanies.length}</span>
          </div>
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">DSA_PATTERNS: </span>
            <span className="font-bold text-[#33ff66] text-sm">48 TOPICS</span>
          </div>
          <div className="p-2.5 border border-[#1a2e1a] bg-[#0f170e]">
            <span className="text-[#62ad6a]">INDEXED_PROBLEMS: </span>
            <span className="font-bold text-[#33ff66] text-sm">{totalQuestions.toLocaleString()}</span>
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
              placeholder="SEARCH_DIRECTORY (e.g. Amazon, Google, Meta)..."
              className="w-full bg-transparent text-[#33ff66] placeholder-[#62ad6a] text-xs sm:text-sm focus:outline-none font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[#62ad6a] hover:text-[#33ff66] p-1 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#62ad6a] font-mono">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0f170e] border border-[#1a2e1a] text-[#33ff66] text-xs px-2.5 py-2 focus:border-[#33ff66] focus:outline-none font-mono cursor-pointer"
            >
              <option value="count-desc">MOST QUESTIONS (DESC)</option>
              <option value="count-asc">LEAST QUESTIONS (ASC)</option>
              <option value="alpha-asc">ALPHABETICAL (A-Z)</option>
              <option value="alpha-desc">ALPHABETICAL (Z-A)</option>
            </select>

            {(search || selectedLetter !== 'ALL' || sortBy !== 'count-desc') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs text-[#ff3b3b] border border-[#ff3b3b]/30 hover:bg-[#ff3b3b] hover:text-[#0b0f0a] transition-colors font-bold font-mono"
              >
                [RESET]
              </button>
            )}
          </div>
        </div>

        {/* Quick Alphabet Filter Ribbon */}
        <div className="flex flex-wrap gap-1 items-center border-t border-[#1a2e1a] pt-2.5">
          <span className="text-[11px] text-[#62ad6a] mr-1 hidden sm:inline">ALPHA_INDEX:</span>
          {ALPHABETS.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2 py-0.5 text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[#33ff66] text-[#0b0f0a] font-bold border border-[#33ff66]'
                    : 'text-[#62ad6a] hover:text-[#33ff66] hover:bg-[#0f170e] border border-transparent'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#62ad6a] font-mono px-1">
          <span>MATCHING ORGANIZATIONS: <strong className="text-[#33ff66]">{filteredCompanies.length}</strong></span>
          <span>AVAILABLE FOR INSPECTION</span>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="p-12 border border-[#1a2e1a] bg-[#0b0f0a] text-center space-y-3">
            <p className="text-sm text-[#ff3b3b] font-arcade">NO MATCHING ORGANIZATIONS FOUND</p>
            <p className="text-xs text-[#62ad6a]">NO MODULES MATCH QUERY: &quot;{search}&quot;</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-[#33ff66] text-[#0b0f0a] text-xs font-bold hover:bg-white transition-colors"
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
                  className="p-3 border border-[#1a2e1a] bg-[#0b0f0a] hover:border-[#33ff66] hover:bg-[#0f170e] transition-all group flex flex-col justify-between space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1 border-b border-[#1a2e1a] pb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-[#33ff66] group-hover:text-white truncate">
                      {comp.company.toUpperCase()}
                    </span>
                    <span className="font-mono text-[11px] text-[#62ad6a] bg-[#0f170e] px-1.5 py-0.5 border border-[#1a2e1a] shrink-0">
                      {comp.count} Qs
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <RatioBar
                      easy={comp.easy_count}
                      med={comp.medium_count}
                      hard={comp.hard_count}
                      total={comp.count}
                    />

                    <div className="flex items-center justify-between text-[10px] text-[#62ad6a] pt-0.5 font-mono">
                      <span>E:{comp.easy_count || 0}</span>
                      <span>M:{comp.medium_count || 0}</span>
                      <span>H:{comp.hard_count || 0}</span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-[#62ad6a] group-hover:text-[#33ff66] font-bold pt-1 border-t border-[#1a2e1a]">
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
