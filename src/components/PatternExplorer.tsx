'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  ArrowUpDown,
  Building2,
  BookOpen
} from 'lucide-react';
import { PatternProblem, PatternOverview } from '@/lib/db';

interface PatternExplorerProps {
  slug: string;
  initialData?: {
    problems: PatternProblem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    overview: PatternOverview | null;
  };
}

export function PatternExplorer({ slug, initialData }: PatternExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialDifficulty = searchParams.get('difficulty')
    ? searchParams.get('difficulty')!.split(',').map((d) => d.trim()).filter(Boolean)
    : [];
  const initialCompany = searchParams.get('company') || 'ALL';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'accuracy-desc';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialLimit = parseInt(searchParams.get('limit') || '50', 10) || 50;

  const [problems, setProblems] = useState<PatternProblem[]>(initialData?.problems || []);
  const [overview, setOverview] = useState<PatternOverview | null>(initialData?.overview || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(initialDifficulty);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Pagination States
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalCount, setTotalCount] = useState(initialData?.pagination?.total || 0);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);

  // Solved state tracking in localStorage
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('leetcamp_solved_problems');
      if (stored) {
        setSolvedMap(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleSolved = (problemId: number, problemTitle: string) => {
    const key = `pattern_${slug}_${problemId}_${problemTitle}`;
    const nextState = !solvedMap[key];
    const updated = { ...solvedMap, [key]: nextState };
    setSolvedMap(updated);

    try {
      localStorage.setItem('leetcamp_solved_problems', JSON.stringify(updated));

      // Calculate count for this specific pattern
      const patternKeys = Object.keys(updated).filter(k => k.startsWith(`pattern_${slug}_`) && updated[k]);
      const patternSolvedMap = JSON.parse(localStorage.getItem('leetcamp_solved_patterns') || '{}');
      patternSolvedMap[slug] = patternKeys.length;
      localStorage.setItem('leetcamp_solved_patterns', JSON.stringify(patternSolvedMap));
    } catch {
      // Ignore
    }
  };

  // Sync URL shallowly
  const updateUrl = useCallback(
    (diffs: string[], comp: string, sq: string, sort: string, p: number, lim: number) => {
      const params = new URLSearchParams();
      if (diffs.length > 0) params.set('difficulty', diffs.join(','));
      if (comp && comp !== 'ALL') params.set('company', comp);
      if (sq.trim()) params.set('search', sq.trim());
      if (sort && sort !== 'accuracy-desc') params.set('sort', sort);
      if (p > 1) params.set('page', p.toString());
      if (lim !== 50) params.set('limit', lim.toString());

      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch problems on filter/pagination change
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulties.length > 0) {
        params.set('difficulty', selectedDifficulties.join(','));
      }
      if (selectedCompany && selectedCompany !== 'ALL') {
        params.set('company', selectedCompany);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (sortBy) {
        params.set('sort', sortBy);
      }
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/patterns/${encodeURIComponent(slug)}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load problems (HTTP ${res.status})`);
      }
      const data = await res.json();
      setProblems(data.problems || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      if (data.overview) {
        setOverview(data.overview);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading problems');
    } finally {
      setLoading(false);
    }
  }, [slug, selectedDifficulties, selectedCompany, searchQuery, sortBy, page, limit]);

  // Trigger fetch whenever filter states change
  useEffect(() => {
    fetchProblems();
    updateUrl(selectedDifficulties, selectedCompany, searchQuery, sortBy, page, limit);
  }, [selectedDifficulties, selectedCompany, searchQuery, sortBy, page, limit, fetchProblems, updateUrl]);

  // Toggle difficulty selection
  const handleDifficultyToggle = (diff: string) => {
    setPage(1);
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const handleCompanySelect = (comp: string) => {
    setPage(1);
    setSelectedCompany(comp);
  };

  const resetAllFilters = () => {
    setSelectedDifficulties([]);
    setSelectedCompany('ALL');
    setSearchQuery('');
    setSortBy('accuracy-desc');
    setPage(1);
  };

  const hasActiveFilters =
    selectedDifficulties.length > 0 ||
    (selectedCompany && selectedCompany !== 'ALL') ||
    searchQuery.trim().length > 0 ||
    sortBy !== 'accuracy-desc';

  // Count solved for current pattern
  const solvedCountInPattern = Object.keys(solvedMap).filter(
    (k) => k.startsWith(`pattern_${slug}_`) && solvedMap[k]
  ).length;

  const categoryName = overview?.category || slug.replace(/-/g, ' ').toUpperCase();
  const totalInPattern = overview?.stats?.total || totalCount;
  const progressPct = totalInPattern > 0 ? ((solvedCountInPattern / totalInPattern) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 font-mono text-xs text-[#33ff66] w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[11px] text-[#62ad6a]">
        <Link href="/" className="hover:text-[#33ff66] transition-colors">
          [LEETCAMP.SYS]
        </Link>
        <span>&gt;</span>
        <Link href="/patterns" className="hover:text-[#33ff66] transition-colors">
          [DSA PATTERNS]
        </Link>
        <span>&gt;</span>
        <span className="text-[#33ff66] font-bold">[{categoryName.toUpperCase()}]</span>
      </div>

      {/* Hero Overview Header */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-4 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a2e1a] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#33ff66] font-arcade text-xs sm:text-sm">
              ★ PATTERN ROADMAP: {categoryName.toUpperCase()} ★
            </span>
          </div>
          {overview?.group && (
            <span className="text-[10px] text-[#0b0f0a] bg-[#33ff66] px-2 py-0.5 font-bold">
              {overview.group.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {/* Total & Solved Counter */}
          <div className="border border-[#1a2e1a] bg-[#0f170e] p-3 space-y-1">
            <span className="text-[10px] text-[#62ad6a] block font-bold">PROGRESS</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm sm:text-base font-bold text-[#33ff66]">
                {solvedCountInPattern} / {totalInPattern}
              </span>
              <span className="text-xs text-[#62ad6a]">{progressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#142013] border border-[#1a2e1a] overflow-hidden mt-1">
              <div
                style={{ width: `${progressPct}%` }}
                className="bg-[#33ff66] h-full transition-all duration-300 shadow-[0_0_8px_rgba(51,255,102,0.8)]"
              />
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="border border-[#1a2e1a] bg-[#0f170e] p-3 space-y-1">
            <span className="text-[10px] text-[#62ad6a] block font-bold">DIFFICULTY DISTRIBUTION</span>
            <div className="flex items-center justify-between text-[11px] pt-1">
              {overview?.stats.basic ? (
                <span className="text-[#00e5ff]">Basic: {overview.stats.basic}</span>
              ) : null}
              <span className="text-[#33ff66]">Easy: {overview?.stats.easy || 0}</span>
              <span className="text-[#ffb000]">Med: {overview?.stats.medium || 0}</span>
              <span className="text-[#ff3b3b]">Hard: {overview?.stats.hard || 0}</span>
            </div>
          </div>

          {/* Average Accuracy */}
          <div className="border border-[#1a2e1a] bg-[#0f170e] p-3 space-y-1">
            <span className="text-[10px] text-[#62ad6a] block font-bold">AVG ACCURACY</span>
            <div className="text-sm sm:text-base font-bold text-[#33ff66] pt-0.5">
              {overview?.stats?.avgAccuracy ? `${overview.stats.avgAccuracy}%` : 'N/A'}
            </div>
          </div>

          {/* Companies Tagged */}
          <div className="border border-[#1a2e1a] bg-[#0f170e] p-3 space-y-1">
            <span className="text-[10px] text-[#62ad6a] block font-bold">COMPANY INTERVIEW TAGS</span>
            <div className="text-sm sm:text-base font-bold text-[#33ff66] pt-0.5">
              {overview?.companies?.length || 0} ORGANIZATIONS
            </div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-4 space-y-4 shadow-lg">
        {/* Row 1: Difficulty Buttons & Company Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a2e1a] pb-3">
          {/* Difficulty Multi-Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#62ad6a] font-bold mr-1">DIFFICULTY:</span>
            {['Basic', 'Easy', 'Medium', 'Hard'].map((diff) => {
              const active = selectedDifficulties.includes(diff);
              let colorClasses = '';
              if (diff === 'Basic') colorClasses = active ? 'bg-[#00e5ff] text-[#0b0f0a] border-[#00e5ff]' : 'text-[#00e5ff] border-[#00e5ff]/30';
              if (diff === 'Easy') colorClasses = active ? 'bg-[#33ff66] text-[#0b0f0a] border-[#33ff66]' : 'text-[#33ff66] border-[#33ff66]/30';
              if (diff === 'Medium') colorClasses = active ? 'bg-[#ffb000] text-[#0b0f0a] border-[#ffb000]' : 'text-[#ffb000] border-[#ffb000]/30';
              if (diff === 'Hard') colorClasses = active ? 'bg-[#ff3b3b] text-[#0b0f0a] border-[#ff3b3b]' : 'text-[#ff3b3b] border-[#ff3b3b]/30';

              return (
                <button
                  key={diff}
                  onClick={() => handleDifficultyToggle(diff)}
                  className={`px-2.5 py-1 text-xs font-bold border transition-all ${colorClasses}`}
                >
                  [{diff.toUpperCase()}]
                </button>
              );
            })}
          </div>

          {/* Company Tag Filter */}
          {overview?.companies && overview.companies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#62ad6a] font-bold">COMPANY:</span>
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanySelect(e.target.value)}
                className="bg-[#0f170e] border border-[#1a2e1a] text-[#33ff66] text-xs px-2.5 py-1.5 focus:border-[#33ff66] focus:outline-none font-mono cursor-pointer max-w-[200px]"
              >
                <option value="ALL">ALL COMPANIES ({overview.companies.length})</option>
                {overview.companies.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 2: Search Query & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md flex items-center bg-[#0f170e] border border-[#1a2e1a] focus-within:border-[#33ff66] px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-[#62ad6a] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="SEARCH_TITLE (e.g. Subarray, Knapsack, Tree)..."
              className="w-full bg-transparent text-[#33ff66] placeholder-[#62ad6a] text-xs focus:outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="text-[#62ad6a] hover:text-[#33ff66]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#62ad6a] font-bold">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-[#0f170e] border border-[#1a2e1a] text-[#33ff66] text-xs px-2.5 py-1.5 focus:border-[#33ff66] focus:outline-none font-mono cursor-pointer"
            >
              <option value="accuracy-desc">HIGHEST ACCURACY</option>
              <option value="accuracy-asc">LOWEST ACCURACY</option>
              <option value="difficulty-asc">DIFFICULTY (EASY → HARD)</option>
              <option value="difficulty-desc">DIFFICULTY (HARD → EASY)</option>
              <option value="title-asc">TITLE (A-Z)</option>
              <option value="title-desc">TITLE (Z-A)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 text-xs text-[#ff3b3b] border border-[#ff3b3b]/40 hover:bg-[#ff3b3b] hover:text-[#0b0f0a] transition-colors font-bold"
              >
                [RESET]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-[#62ad6a] px-1">
        <span>
          MATCHING: <strong className="text-[#33ff66]">{totalCount}</strong> PROBLEMS
        </span>
        <span>
          PAGE {page} OF {totalPages}
        </span>
      </div>

      {/* Problems Table View */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] overflow-x-auto shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#62ad6a] font-mono space-y-2">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[#33ff66] border-t-transparent rounded-full" />
            <p className="tracking-wider">QUERYING_SQLITE_ARCHIVE...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#ff3b3b] space-y-3">
            <p>ERROR: {error}</p>
            <button
              onClick={fetchProblems}
              className="px-3 py-1 bg-[#ff3b3b] text-[#0b0f0a] font-bold"
            >
              [RETRY]
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#62ad6a] space-y-3">
            <p className="text-[#ffb000]">NO PROBLEMS MATCHING CURRENT FILTERS</p>
            <button
              onClick={resetAllFilters}
              className="px-3 py-1 bg-[#33ff66] text-[#0b0f0a] font-bold"
            >
              [CLEAR FILTERS]
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1a2e1a] bg-[#0f170e] text-[#62ad6a] select-none text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center font-bold">STATUS</th>
                <th className="py-2.5 px-3 w-12 text-center font-bold">#</th>
                <th className="py-2.5 px-3 font-bold">PROBLEM TITLE</th>
                <th className="py-2.5 px-3 w-28 text-center font-bold">DIFFICULTY</th>
                <th className="py-2.5 px-3 w-28 text-center font-bold">ACCURACY</th>
                <th className="py-2.5 px-3 font-bold hidden md:table-cell">COMPANY TAGS</th>
                <th className="py-2.5 px-3 w-24 text-center font-bold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2e1a]">
              {problems.map((prob, idx) => {
                const globalIdx = (page - 1) * limit + idx + 1;
                const key = `pattern_${slug}_${prob.id}_${prob.title}`;
                const isSolved = !!solvedMap[key];

                let diffColor = 'text-[#33ff66] border-[#33ff66]/30';
                if (prob.difficulty === 'Basic') diffColor = 'text-[#00e5ff] border-[#00e5ff]/30';
                if (prob.difficulty === 'Medium') diffColor = 'text-[#ffb000] border-[#ffb000]/30';
                if (prob.difficulty === 'Hard') diffColor = 'text-[#ff3b3b] border-[#ff3b3b]/30';

                const companyList = prob.company_tags
                  ? prob.company_tags.split(',').map((c) => c.replace(/\+\d+/, '').trim()).filter(Boolean)
                  : [];

                return (
                  <tr
                    key={prob.id}
                    className={`hover:bg-[#0f170e] transition-colors group ${
                      isSolved ? 'bg-[#0f170e]/60 opacity-80' : ''
                    }`}
                  >
                    {/* Status Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => toggleSolved(prob.id, prob.title)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                        title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                      >
                        {isSolved ? (
                          <CheckSquare className="w-4 h-4 text-[#33ff66] inline-block" />
                        ) : (
                          <Square className="w-4 h-4 text-[#62ad6a] hover:text-[#33ff66] inline-block" />
                        )}
                      </button>
                    </td>

                    {/* Row Index */}
                    <td className="py-2.5 px-3 text-center text-[#62ad6a] text-[11px]">
                      {globalIdx}
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline flex items-center gap-1.5 font-bold ${
                          isSolved ? 'text-[#62ad6a] line-through' : 'text-[#33ff66]'
                        }`}
                      >
                        <span>{prob.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#62ad6a] group-hover:text-[#33ff66] inline-block shrink-0" />
                      </a>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border inline-block ${diffColor}`}>
                        {prob.difficulty.toUpperCase()}
                      </span>
                    </td>

                    {/* Accuracy Percentage */}
                    <td className="py-2.5 px-3 text-center">
                      {prob.accuracy !== null ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-[#62ad6a]">
                            {prob.accuracy}%
                          </span>
                          <div className="w-16 mx-auto h-1 bg-[#142013] border border-[#1a2e1a] overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, prob.accuracy)}%` }}
                              className="bg-[#62ad6a] h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#62ad6a]">-</span>
                      )}
                    </td>

                    {/* Company Tags */}
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      {companyList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {companyList.slice(0, 3).map((comp) => (
                            <button
                              key={comp}
                              onClick={() => handleCompanySelect(comp)}
                              className="px-1.5 py-0.5 text-[10px] bg-[#0f170e] text-[#62ad6a] border border-[#1a2e1a] hover:border-[#33ff66] hover:text-[#33ff66] transition-colors"
                            >
                              {comp}
                            </button>
                          ))}
                          {companyList.length > 3 && (
                            <span className="text-[10px] text-[#62ad6a] self-center">
                              +{companyList.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#62ad6a] text-[10px]">General DSA</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-2.5 px-3 text-center">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-[11px] text-[#33ff66] border border-[#1a2e1a] hover:border-[#33ff66] hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-colors font-bold inline-block"
                      >
                        [SOLVE]
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <div className="text-[#62ad6a]">
            SHOWING {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} OF {totalCount}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-[#1a2e1a] hover:border-[#33ff66] text-[#33ff66] disabled:opacity-30 disabled:pointer-events-none transition-colors font-bold"
            >
              [◄ PREV]
            </button>
            <span className="px-2 text-[#33ff66] font-bold">
              PAGE {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-[#1a2e1a] hover:border-[#33ff66] text-[#33ff66] disabled:opacity-30 disabled:pointer-events-none transition-colors font-bold"
            >
              [NEXT ►]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
