'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, Search, ArrowRight, Layers, Flame, BookOpen } from 'lucide-react';
import { PatternSummary, PatternRoadmapGroup } from '@/lib/db';

interface PatternDirectoryProps {
  initialPatterns: PatternSummary[];
}

const ROADMAP_GROUPS: { id: string; label: string; group?: PatternRoadmapGroup }[] = [
  { id: 'ALL', label: 'ALL PATTERNS' },
  { id: 'CORE', label: 'CORE DATA STRUCTURES', group: 'Core Data Structures' },
  { id: 'TREES', label: 'TREES & HIERARCHIES', group: 'Trees & Hierarchies' },
  { id: 'GRAPHS', label: 'GRAPHS & NETWORKS', group: 'Graphs & Networks' },
  { id: 'ALGO', label: 'ALGORITHMIC TECHNIQUES', group: 'Algorithmic Techniques' },
  { id: 'DP', label: 'DP & RECURSION', group: 'Dynamic Programming & Recursion' },
  { id: 'MATH', label: 'MATH & ADVANCED', group: 'Math & Advanced Concepts' },
];

interface RatioBarProps {
  basic?: number;
  easy?: number;
  med?: number;
  hard?: number;
  total: number;
}

function RatioBar({ basic = 0, easy = 0, med = 0, hard = 0, total }: RatioBarProps) {
  const b = basic || 0;
  const e = easy || 0;
  const m = med || 0;
  const h = hard || 0;
  const tot = total || b + e + m + h;

  if (tot <= 0) {
    return <div className="w-full h-1.5 bg-[#1a231a] rounded-sm overflow-hidden" />;
  }

  const basicPct = ((b / tot) * 100).toFixed(1);
  const easyPct = ((e / tot) * 100).toFixed(1);
  const medPct = ((m / tot) * 100).toFixed(1);
  const hardPct = ((h / tot) * 100).toFixed(1);

  return (
    <div
      className="w-full h-1.5 bg-[#1a231a] flex overflow-hidden rounded-sm"
      title={`Basic: ${b} (${basicPct}%), Easy: ${e} (${easyPct}%), Med: ${m} (${medPct}%), Hard: ${h} (${hardPct}%)`}
    >
      {b > 0 && <div style={{ width: `${basicPct}%` }} className="bg-[#38bdf8] h-full" />}
      {e > 0 && <div style={{ width: `${easyPct}%` }} className="bg-[#4ade80] h-full" />}
      {m > 0 && <div style={{ width: `${medPct}%` }} className="bg-[#fbbf24] h-full" />}
      {h > 0 && <div style={{ width: `${hardPct}%` }} className="bg-[#f87171] h-full" />}
    </div>
  );
}

export function PatternDirectory({ initialPatterns }: PatternDirectoryProps) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'alpha-asc' | 'alpha-desc' | 'accuracy-desc'>('count-desc');
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('leetcamp_solved_patterns');
      if (saved) {
        setSolvedCounts(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const totalQuestions = useMemo(() => {
    return initialPatterns.reduce((acc, p) => acc + p.count, 0);
  }, [initialPatterns]);

  const groupedPatterns = useMemo(() => {
    const map = new Map<PatternRoadmapGroup, PatternSummary[]>();
    for (const p of initialPatterns) {
      const list = map.get(p.group) || [];
      list.push(p);
      map.set(p.group, list);
    }
    return map;
  }, [initialPatterns]);

  const filteredPatterns = useMemo(() => {
    return initialPatterns
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          if (!p.category.toLowerCase().includes(q) && !p.group.toLowerCase().includes(q)) {
            return false;
          }
        }
        if (activeGroup !== 'ALL') {
          const matchedGroup = ROADMAP_GROUPS.find((g) => g.id === activeGroup);
          if (matchedGroup?.group && p.group !== matchedGroup.group) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'count-desc') return b.count - a.count;
        if (sortBy === 'count-asc') return a.count - b.count;
        if (sortBy === 'alpha-asc') return a.category.localeCompare(b.category);
        if (sortBy === 'alpha-desc') return b.category.localeCompare(a.category);
        if (sortBy === 'accuracy-desc') return (b.avg_accuracy || 0) - (a.avg_accuracy || 0);
        return 0;
      });
  }, [initialPatterns, search, activeGroup, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setActiveGroup('ALL');
    setSortBy('count-desc');
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#4ade80] w-full">
      {/* Hub Hero Banner */}
      <div className="border border-[#233823] bg-[#151c15] p-4 sm:p-6 space-y-4 shadow-xl rounded-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#233823] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#4ade80] font-arcade text-xs sm:text-sm">
              ★ DSA PATTERNS & ROADMAPS ARCHIVE ★
            </span>
          </div>
          <div className="text-xs text-[#86a789] font-mono">
            48_TOPIC_COLLECTIONS // {totalQuestions.toLocaleString()}_CURATED_QUESTIONS
          </div>
        </div>

        <div className="space-y-2 max-w-4xl">
          <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#4ade80] tracking-tight leading-relaxed">
            48 ALGORITHMIC PATTERNS & DATA STRUCTURES
          </h1>
          <p className="text-xs text-[#86a789] leading-relaxed">
            &gt; CURATED REPOSITORY OF {totalQuestions.toLocaleString()}+ PROBLEMS STRUCTURED ACROSS 6 ROADMAP PILLARS (CORE DS, TREES, GRAPHS, ALGORITHMIC TECHNIQUES, DP, AND MATH).
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#233823]">
          <Link
            href="/"
            className="px-3 py-1.5 text-xs bg-[#151c15] text-[#86a789] hover:text-[#4ade80] hover:border-[#4ade80] font-bold border border-[#233823] flex items-center gap-1.5 transition-colors rounded-sm"
          >
            [← COMPANY DIRECTORY (429)]
          </Link>
          <span className="px-3 py-1.5 text-xs bg-[#4ade80] text-[#111611] font-bold border border-[#4ade80] flex items-center gap-1.5 shadow-[0_0_8px_rgba(74,222,128,0.3)] rounded-sm">
            <Layers className="w-3.5 h-3.5" />
            [DSA PATTERNS & ROADMAPS (48 TOPICS / {totalQuestions.toLocaleString()} Qs)]
          </span>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">PATTERNS</span>
            <span className="font-bold text-[#4ade80] text-sm">{initialPatterns.length} CATEGORIES</span>
          </div>
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">CURATED QUESTIONS</span>
            <span className="font-bold text-[#fbbf24] text-sm">{totalQuestions.toLocaleString()} PROBLEMS</span>
          </div>
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">ROADMAP PILLARS</span>
            <span className="font-bold text-[#4ade80] text-sm">6 CORE TRACKS</span>
          </div>
          <div className="p-2.5 border border-[#233823] bg-[#111611] rounded-sm">
            <span className="text-[#86a789] block text-[10px]">DIFFICULTY TIERS</span>
            <span className="font-bold text-[#38bdf8] text-sm">4 TIERS (B/E/M/H)</span>
          </div>
        </div>
      </div>

      {/* Control Console */}
      <div className="sticky top-14 z-30 border border-[#233823] bg-[#111611]/95 backdrop-blur-md p-3 sm:p-4 space-y-3 shadow-xl rounded-sm">
        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 flex items-center bg-[#151c15] border border-[#233823] focus-within:border-[#4ade80] px-3 py-2 rounded-sm">
            <span className="text-[#4ade80] font-bold mr-2">&gt;</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH_PATTERNS (e.g. Dynamic Programming, Trees, Sliding Window)..."
              className="w-full bg-transparent text-[#4ade80] placeholder-[#5e7e61] text-xs sm:text-sm focus:outline-none font-mono"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#86a789] hover:text-[#4ade80] p-1 ml-1">
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
              <option value="count-desc">MOST PROBLEMS (DESC)</option>
              <option value="count-asc">FEWEST PROBLEMS (ASC)</option>
              <option value="alpha-asc">ALPHABETICAL (A-Z)</option>
              <option value="alpha-desc">ALPHABETICAL (Z-A)</option>
              <option value="accuracy-desc">HIGHEST ACCURACY %</option>
            </select>

            {(search || activeGroup !== 'ALL' || sortBy !== 'count-desc') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs text-[#f87171] border border-[#f87171]/40 hover:bg-[#f87171] hover:text-[#111611] transition-colors font-bold font-mono rounded-sm"
              >
                [RESET]
              </button>
            )}
          </div>
        </div>

        {/* Roadmap Pillar Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 items-center border-t border-[#233823] pt-2.5">
          <span className="text-[11px] text-[#86a789] mr-1 hidden sm:inline">PILLARS:</span>
          {ROADMAP_GROUPS.map((g) => {
            const isSelected = activeGroup === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={`px-2.5 py-1 text-xs font-mono transition-all rounded-sm ${
                  isSelected
                    ? 'bg-[#4ade80] text-[#111611] font-bold border border-[#4ade80]'
                    : 'text-[#86a789] hover:text-[#4ade80] hover:bg-[#151c15] border border-[#233823]'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Roadmap Pillar Sections */}
      {activeGroup === 'ALL' && !search.trim() ? (
        <div className="space-y-8">
          {Array.from(groupedPatterns.entries()).map(([groupName, patterns]) => {
            const groupTotal = patterns.reduce((sum, p) => sum + p.count, 0);
            return (
              <div key={groupName} className="space-y-3.5">
                {/* Pillar Header */}
                <div className="flex items-center justify-between border-b border-[#233823] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-arcade text-[#4ade80]">
                      ▓ {groupName.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-[#86a789]">
                      ({patterns.length} TOPICS · {groupTotal.toLocaleString()} PROBLEMS)
                    </span>
                  </div>
                </div>

                {/* Pattern Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {patterns.map((pattern) => {
                    const solved = solvedCounts[pattern.slug] || 0;
                    return (
                      <Link
                        key={pattern.slug}
                        href={`/patterns/${pattern.slug}`}
                        className="border border-[#233823] bg-[#151c15] hover:bg-[#1b261b] hover:border-[#4ade80] p-3.5 sm:p-4 space-y-3 transition-all group relative overflow-hidden shadow-sm rounded-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-arcade text-[#4ade80] group-hover:text-white transition-colors line-clamp-1">
                              {pattern.category.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#86a789] block">
                              {pattern.group}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-[#fbbf24] bg-[#111611] px-2 py-0.5 border border-[#233823] shrink-0 font-bold rounded-sm">
                            [{pattern.count} Qs]
                          </span>
                        </div>

                        {/* Ratio breakdown bar */}
                        <RatioBar
                          basic={pattern.basic_count}
                          easy={pattern.easy_count}
                          med={pattern.medium_count}
                          hard={pattern.hard_count}
                          total={pattern.count}
                        />

                        <div className="flex items-center justify-between text-[10px] text-[#86a789] pt-1 border-t border-[#233823]/60 font-mono">
                          <div className="flex items-center gap-1.5">
                            {pattern.basic_count > 0 && <span className="text-[#38bdf8]">B:{pattern.basic_count}</span>}
                            {pattern.basic_count > 0 && <span className="text-[#5e7e61]">·</span>}
                            <span>E:{pattern.easy_count}</span>
                            <span className="text-[#5e7e61]">·</span>
                            <span className="text-[#fbbf24]">M:{pattern.medium_count}</span>
                            <span className="text-[#5e7e61]">·</span>
                            <span className="text-[#f87171]">H:{pattern.hard_count}</span>
                          </div>
                          {pattern.avg_accuracy && (
                            <span className="text-[#86a789] font-bold">
                              {pattern.avg_accuracy}% ACC
                            </span>
                          )}
                        </div>

                        {solved > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-[#4ade80] font-bold pt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                            <span>SOLVED {solved}/{pattern.count}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Filtered Grid View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#86a789]">
            <span>FOUND {filteredPatterns.length} MATCHING PATTERNS</span>
            <span>TOTAL QUESTIONS: {filteredPatterns.reduce((acc, p) => acc + p.count, 0)}</span>
          </div>

          {filteredPatterns.length === 0 ? (
            <div className="border border-[#233823] bg-[#151c15] p-8 text-center space-y-3 rounded-sm">
              <p className="text-xs text-[#f87171]">NO PATTERNS FOUND MATCHING CRITERIA</p>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs bg-[#4ade80] text-[#111611] font-bold rounded-sm"
              >
                [RESET FILTERS]
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredPatterns.map((pattern) => {
                const solved = solvedCounts[pattern.slug] || 0;
                return (
                  <Link
                    key={pattern.slug}
                    href={`/patterns/${pattern.slug}`}
                    className="border border-[#233823] bg-[#151c15] hover:bg-[#1b261b] hover:border-[#4ade80] p-3.5 sm:p-4 space-y-3 transition-all group relative overflow-hidden shadow-sm rounded-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-arcade text-[#4ade80] group-hover:text-white transition-colors line-clamp-1">
                          {pattern.category.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#86a789] block">
                          {pattern.group}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#fbbf24] bg-[#111611] px-2 py-0.5 border border-[#233823] shrink-0 font-bold rounded-sm">
                        [{pattern.count} Qs]
                      </span>
                    </div>

                    <RatioBar
                      basic={pattern.basic_count}
                      easy={pattern.easy_count}
                      med={pattern.medium_count}
                      hard={pattern.hard_count}
                      total={pattern.count}
                    />

                    <div className="flex items-center justify-between text-[10px] text-[#86a789] pt-1 border-t border-[#233823]/60 font-mono">
                      <div className="flex items-center gap-1.5">
                        {pattern.basic_count > 0 && <span className="text-[#38bdf8]">B:{pattern.basic_count}</span>}
                        {pattern.basic_count > 0 && <span className="text-[#5e7e61]">·</span>}
                        <span>E:{pattern.easy_count}</span>
                        <span className="text-[#5e7e61]">·</span>
                        <span className="text-[#fbbf24]">M:{pattern.medium_count}</span>
                        <span className="text-[#5e7e61]">·</span>
                        <span className="text-[#f87171]">H:{pattern.hard_count}</span>
                      </div>
                      {pattern.avg_accuracy && (
                        <span className="text-[#86a789] font-bold">
                          {pattern.avg_accuracy}% ACC
                        </span>
                      )}
                    </div>

                    {solved > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#4ade80] font-bold pt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                        <span>SOLVED {solved}/{pattern.count}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
