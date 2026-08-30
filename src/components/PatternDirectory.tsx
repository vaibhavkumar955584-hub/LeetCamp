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
    return <div className="w-full h-1.5 bg-[#142013] border border-[#1a2e1a] overflow-hidden" />;
  }

  const basicPct = ((b / tot) * 100).toFixed(1);
  const easyPct = ((e / tot) * 100).toFixed(1);
  const medPct = ((m / tot) * 100).toFixed(1);
  const hardPct = ((h / tot) * 100).toFixed(1);

  return (
    <div
      className="w-full h-1.5 bg-[#142013] border border-[#1a2e1a] flex overflow-hidden"
      title={`Basic: ${b} (${basicPct}%), Easy: ${e} (${easyPct}%), Med: ${m} (${medPct}%), Hard: ${h} (${hardPct}%)`}
    >
      {b > 0 && <div style={{ width: `${basicPct}%` }} className="bg-[#00e5ff] h-full" />}
      {e > 0 && <div style={{ width: `${easyPct}%` }} className="bg-[#33ff66] h-full" />}
      {m > 0 && <div style={{ width: `${medPct}%` }} className="bg-[#ffb000] h-full" />}
      {h > 0 && <div style={{ width: `${hardPct}%` }} className="bg-[#ff3b3b] h-full" />}
    </div>
  );
}

export function PatternDirectory({ initialPatterns }: PatternDirectoryProps) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'alpha-asc' | 'alpha-desc' | 'accuracy-desc'>('count-desc');
  const [solvedCounts, setSolvedCounts] = useState<Record<string, number>>({});

  // Read solved problems from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('leetcamp_solved_patterns');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSolvedCounts(parsed);
      }
    } catch {
      // Ignore
    }
  }, []);

  const totalPatternProblems = useMemo(() => {
    return initialPatterns.reduce((acc, p) => acc + p.count, 0);
  }, [initialPatterns]);

  const filteredPatterns = useMemo(() => {
    return initialPatterns
      .filter((p) => {
        // Group filter
        if (selectedGroup !== 'ALL') {
          const groupMeta = ROADMAP_GROUPS.find((g) => g.id === selectedGroup);
          if (groupMeta && groupMeta.group && p.group !== groupMeta.group) {
            return false;
          }
        }

        // Search query
        if (search.trim()) {
          const s = search.toLowerCase().trim();
          if (!p.category.toLowerCase().includes(s) && !p.group.toLowerCase().includes(s)) {
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
  }, [initialPatterns, search, selectedGroup, sortBy]);

  // Grouped by Roadmap Pillars for Structured View
  const groupedPatterns = useMemo(() => {
    if (selectedGroup !== 'ALL' || search.trim()) {
      return null;
    }

    const groups: { [key in PatternRoadmapGroup]?: PatternSummary[] } = {};
    for (const p of initialPatterns) {
      if (!groups[p.group]) {
        groups[p.group] = [];
      }
      groups[p.group]!.push(p);
    }
    return groups;
  }, [initialPatterns, selectedGroup, search]);

  const clearFilters = () => {
    setSearch('');
    setSelectedGroup('ALL');
    setSortBy('count-desc');
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#33ff66] w-full">
      {/* Header Banner */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a2e1a] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#33ff66] font-arcade text-xs sm:text-sm">
              ★ LEETCAMP // DSA PATTERNS & ROADMAPS ★
            </span>
          </div>
          <div className="text-xs text-[#62ad6a] font-mono">
            ARCHIVE_STAT: [ONLINE] // {initialPatterns.length}_PATTERNS // {totalPatternProblems.toLocaleString()}_QUESTIONS
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#33ff66] tracking-tight leading-relaxed">
            DSA PATTERN DIRECTORY — CURATED TOPIC ROADMAPS
          </h1>
          <p className="text-xs sm:text-sm text-[#62ad6a] leading-relaxed max-w-4xl font-mono">
            Master Data Structures & Algorithms by structural patterns. Explore 48 categorized topic roadmaps, track your solved progress locally, filter by company interview tags, and conquer technical assessments.
          </p>
        </div>

        {/* Quick Difficulty Legend */}
        <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] text-[#62ad6a] border-t border-[#1a2e1a]">
          <span className="text-[#33ff66] font-bold">LEGEND:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#00e5ff] inline-block" /> Basic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#33ff66] inline-block" /> Easy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#ffb000] inline-block" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#ff3b3b] inline-block" /> Hard
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-4 space-y-4">
        {/* Roadmap Group Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#1a2e1a] pb-3">
          {ROADMAP_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-2.5 py-1 text-xs font-bold transition-all border ${
                selectedGroup === g.id
                  ? 'bg-[#33ff66] text-[#0b0f0a] border-[#33ff66] shadow-[0_0_8px_rgba(51,255,102,0.3)]'
                  : 'bg-[#0f170e] text-[#62ad6a] border-[#1a2e1a] hover:border-[#33ff66] hover:text-[#33ff66]'
              }`}
            >
              [{g.label}]
            </button>
          ))}
        </div>

        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md flex items-center bg-[#0f170e] border border-[#1a2e1a] focus-within:border-[#33ff66] px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#62ad6a] mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH_PATTERN (e.g. Dynamic Programming, Tree)..."
              className="w-full bg-transparent text-[#33ff66] placeholder-[#62ad6a] text-xs focus:outline-none font-mono"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#62ad6a] hover:text-[#33ff66]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#62ad6a] font-bold">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0f170e] border border-[#1a2e1a] text-[#33ff66] text-xs px-2.5 py-1.5 focus:border-[#33ff66] focus:outline-none font-mono cursor-pointer"
            >
              <option value="count-desc">MOST PROBLEMS (DESC)</option>
              <option value="count-asc">LEAST PROBLEMS (ASC)</option>
              <option value="accuracy-desc">HIGHEST ACCURACY</option>
              <option value="alpha-asc">ALPHABETICAL (A-Z)</option>
              <option value="alpha-desc">ALPHABETICAL (Z-A)</option>
            </select>

            {(search || selectedGroup !== 'ALL' || sortBy !== 'count-desc') && (
              <button
                onClick={clearFilters}
                className="px-2.5 py-1.5 text-xs text-[#ff3b3b] border border-[#ff3b3b]/40 hover:bg-[#ff3b3b] hover:text-[#0b0f0a] transition-colors font-bold"
              >
                [RESET]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pattern Cards View */}
      {groupedPatterns && !search.trim() ? (
        // Categorized Structured Roadmap View
        <div className="space-y-8">
          {(Object.entries(groupedPatterns) as [PatternRoadmapGroup, PatternSummary[]][]).map(([groupName, groupItems]) => {
            if (!groupItems || groupItems.length === 0) return null;
            const groupTotal = groupItems.reduce((acc, p) => acc + p.count, 0);

            return (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#1a2e1a] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#33ff66] font-arcade text-xs sm:text-sm">
                      ► {groupName.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#0b0f0a] bg-[#33ff66] px-1.5 py-0.5 font-bold">
                      {groupItems.length} PATTERNS
                    </span>
                  </div>
                  <span className="text-xs text-[#62ad6a]">
                    [{groupTotal.toLocaleString()} TOTAL QUESTIONS]
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {groupItems.map((pattern) => {
                    const solved = solvedCounts[pattern.slug] || 0;
                    return (
                      <Link
                        key={pattern.slug}
                        href={`/patterns/${pattern.slug}`}
                        className="border border-[#1a2e1a] bg-[#0b0f0a] hover:bg-[#0f170e] hover:border-[#33ff66] p-3.5 sm:p-4 space-y-3 transition-all group relative overflow-hidden shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-arcade text-[#33ff66] group-hover:text-white transition-colors line-clamp-1">
                              {pattern.category.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#62ad6a] block">
                              {pattern.group}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#0b0f0a] bg-[#33ff66] px-1.5 py-0.5 shrink-0 group-hover:shadow-[0_0_8px_rgba(51,255,102,0.6)]">
                            {pattern.count} Qs
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

                        <div className="flex items-center justify-between text-[10px] text-[#62ad6a] pt-1 border-t border-[#1a2e1a]/60">
                          <div className="flex items-center gap-1.5">
                            {pattern.basic_count > 0 && <span className="text-[#00e5ff]">B:{pattern.basic_count}</span>}
                            <span>E:{pattern.easy_count}</span>
                            <span className="text-[#ffb000]">M:{pattern.medium_count}</span>
                            <span className="text-[#ff3b3b]">H:{pattern.hard_count}</span>
                          </div>
                          {pattern.avg_accuracy && (
                            <span className="text-[#62ad6a] font-bold">
                              {pattern.avg_accuracy}% ACC
                            </span>
                          )}
                        </div>

                        {solved > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-[#33ff66] font-bold pt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-[#33ff66]" />
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
        // Filtered Grid View
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#62ad6a]">
            <span>FOUND {filteredPatterns.length} MATCHING PATTERNS</span>
            <span>TOTAL QUESTIONS: {filteredPatterns.reduce((acc, p) => acc + p.count, 0)}</span>
          </div>

          {filteredPatterns.length === 0 ? (
            <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-8 text-center space-y-3">
              <p className="text-xs text-[#ff3b3b]">NO PATTERNS FOUND MATCHING CRITERIA</p>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs bg-[#33ff66] text-[#0b0f0a] font-bold"
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
                    className="border border-[#1a2e1a] bg-[#0b0f0a] hover:bg-[#0f170e] hover:border-[#33ff66] p-3.5 sm:p-4 space-y-3 transition-all group relative overflow-hidden shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-arcade text-[#33ff66] group-hover:text-white transition-colors line-clamp-1">
                          {pattern.category.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#62ad6a] block">
                          {pattern.group}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0b0f0a] bg-[#33ff66] px-1.5 py-0.5 shrink-0 group-hover:shadow-[0_0_8px_rgba(51,255,102,0.6)]">
                        {pattern.count} Qs
                      </span>
                    </div>

                    <RatioBar
                      basic={pattern.basic_count}
                      easy={pattern.easy_count}
                      med={pattern.medium_count}
                      hard={pattern.hard_count}
                      total={pattern.count}
                    />

                    <div className="flex items-center justify-between text-[10px] text-[#62ad6a] pt-1 border-t border-[#1a2e1a]/60">
                      <div className="flex items-center gap-1.5">
                        {pattern.basic_count > 0 && <span className="text-[#00e5ff]">B:{pattern.basic_count}</span>}
                        <span>E:{pattern.easy_count}</span>
                        <span className="text-[#ffb000]">M:{pattern.medium_count}</span>
                        <span className="text-[#ff3b3b]">H:{pattern.hard_count}</span>
                      </div>
                      {pattern.avg_accuracy && (
                        <span className="text-[#62ad6a] font-bold">
                          {pattern.avg_accuracy}% ACC
                        </span>
                      )}
                    </div>

                    {solved > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#33ff66] font-bold pt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#33ff66]" />
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
