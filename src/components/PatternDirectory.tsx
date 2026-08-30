'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Layers, Building2, ArrowLeft } from 'lucide-react';
import { PatternSummary, PatternRoadmapGroup } from '@/lib/db';
import PatternCard from './PatternCard';

interface PatternDirectoryProps {
  initialPatterns: PatternSummary[];
}

const ROADMAP_GROUPS: { id: string; label: string; group?: PatternRoadmapGroup }[] = [
  { id: 'ALL', label: 'All Patterns' },
  { id: 'CORE', label: 'Core Data Structures', group: 'Core Data Structures' },
  { id: 'TREES', label: 'Trees & Hierarchies', group: 'Trees & Hierarchies' },
  { id: 'GRAPHS', label: 'Graphs & Networks', group: 'Graphs & Networks' },
  { id: 'ALGO', label: 'Algorithmic Techniques', group: 'Algorithmic Techniques' },
  { id: 'DP', label: 'DP & Recursion', group: 'Dynamic Programming & Recursion' },
  { id: 'MATH', label: 'Math & Advanced', group: 'Math & Advanced Concepts' },
];

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
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Hero Header Section */}
      <div className="data-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-medium">
                DSA Roadmap Hub
              </span>
              <span className="text-xs text-[var(--text-muted)] mono">
                48 Patterns · {totalQuestions.toLocaleString()} Curated Questions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              48 DSA Patterns & Algorithmic Roadmaps
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-3xl leading-relaxed">
              Master data structures and algorithms by underlying patterns rather than random lists. Curated question banks across 6 roadmap pillars: Core Data Structures, Trees, Graphs, Algorithmic Techniques, Dynamic Programming, and Math.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="btn-primary"
            >
              <ArrowLeft size={14} className="text-[var(--text-muted)]" />
              <span>Back to Company Explorer</span>
            </Link>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 rounded-[var(--radius-md)]">
            <span className="label-caps block">Patterns</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mono">
              {initialPatterns.length}
            </span>
          </div>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 rounded-[var(--radius-md)]">
            <span className="label-caps block">Curated Questions</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--diff-medium)] mono">
              {totalQuestions.toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 rounded-[var(--radius-md)]">
            <span className="label-caps block">Roadmap Pillars</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--accent-green)] mono">
              6 Tracks
            </span>
          </div>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 rounded-[var(--radius-md)]">
            <span className="label-caps block">Difficulty Tiers</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--diff-basic)] mono">
              4 Tiers (B/E/M/H)
            </span>
          </div>
        </div>
      </div>

      {/* Search & Pillar Toolbar */}
      <div className="data-surface p-4 space-y-3.5 sticky top-16 z-20 backdrop-blur-md bg-[var(--bg-surface)]/95 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 flex items-center bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus-within:border-[var(--accent-green)] px-3 py-2 rounded-[var(--radius-sm)] transition-colors">
            <Search size={16} className="text-[var(--text-muted)] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns (e.g. Dynamic Programming, Trees, Sliding Window)..."
              className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 ml-1"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs px-3 py-2 rounded-[var(--radius-sm)] focus:border-[var(--accent-green)] focus:outline-none cursor-pointer"
            >
              <option value="count-desc">Most Problems</option>
              <option value="count-asc">Fewest Problems</option>
              <option value="alpha-asc">Alphabetical (A-Z)</option>
              <option value="alpha-desc">Alphabetical (Z-A)</option>
              <option value="accuracy-desc">Highest Accuracy %</option>
            </select>

            {(search || activeGroup !== 'ALL' || sortBy !== 'count-desc') && (
              <button
                onClick={clearFilters}
                className="btn-primary text-[var(--diff-hard)] hover:border-[var(--diff-hard)]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Pillar Tabs */}
        <div className="flex flex-wrap gap-1.5 items-center border-t border-[var(--border-subtle)] pt-3">
          {ROADMAP_GROUPS.map((g) => {
            const isSelected = activeGroup === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
                  isSelected
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
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
        <div className="space-y-10">
          {Array.from(groupedPatterns.entries()).map(([groupName, patterns]) => {
            const groupTotal = patterns.reduce((sum, p) => sum + p.count, 0);
            return (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      {groupName}
                    </h2>
                    <span className="text-xs text-[var(--text-muted)] mono">
                      ({patterns.length} topics · {groupTotal.toLocaleString()} problems)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {patterns.map((pattern) => (
                    <PatternCard
                      key={pattern.slug}
                      pattern={pattern}
                      solvedCount={solvedCounts[pattern.slug]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Filtered Grid View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mono">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{filteredPatterns.length}</strong> matching patterns
            </span>
          </div>

          {filteredPatterns.length === 0 ? (
            <div className="data-surface p-12 text-center space-y-3">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                No matching patterns found
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                No topic collections matched current filters
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary mt-2"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredPatterns.map((pattern) => (
                <PatternCard
                  key={pattern.slug}
                  pattern={pattern}
                  solvedCount={solvedCounts[pattern.slug]}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
