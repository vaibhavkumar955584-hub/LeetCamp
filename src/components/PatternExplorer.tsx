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

  // Filter States (NOTE: DSA Patterns feature 4 difficulty tiers: Basic, Easy, Medium, Hard)
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
      const saved = localStorage.getItem('leetcamp_solved_problems');
      if (saved) {
        setSolvedMap(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleSolved = (problemId: number, title: string) => {
    const key = `pattern_${slug}_${problemId}_${title}`;
    const nextState = !solvedMap[key];
    const updated = { ...solvedMap, [key]: nextState };
    setSolvedMap(updated);

    try {
      localStorage.setItem('leetcamp_solved_problems', JSON.stringify(updated));

      // Calculate solved count for this pattern category
      const solvedInPattern = Object.keys(updated).filter(
        (k) => k.startsWith(`pattern_${slug}_`) && updated[k]
      ).length;

      const savedPatternCounts = JSON.parse(
        localStorage.getItem('leetcamp_solved_patterns') || '{}'
      );
      savedPatternCounts[slug] = solvedInPattern;
      localStorage.setItem('leetcamp_solved_patterns', JSON.stringify(savedPatternCounts));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Sync state to URL search parameters
  const updateUrl = useCallback(
    (
      diffs: string[],
      company: string,
      search: string,
      sort: string,
      currPage: number,
      currLimit: number
    ) => {
      const params = new URLSearchParams();
      if (diffs.length > 0) params.set('difficulty', diffs.join(','));
      if (company !== 'ALL') params.set('company', company);
      if (search.trim()) params.set('search', search.trim());
      if (sort !== 'accuracy-desc') params.set('sort', sort);
      if (currPage > 1) params.set('page', currPage.toString());
      if (currLimit !== 50) params.set('limit', currLimit.toString());

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch problems from API
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulties.length > 0) params.set('difficulty', selectedDifficulties.join(','));
      if (selectedCompany !== 'ALL') params.set('company', selectedCompany);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy) params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/patterns/${slug}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load pattern problems`);
      }

      const data = await res.json();
      setProblems(data.problems || []);
      setOverview(data.overview || null);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching pattern problems:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [slug, selectedDifficulties, selectedCompany, searchQuery, sortBy, page, limit]);

  useEffect(() => {
    fetchProblems();
    updateUrl(selectedDifficulties, selectedCompany, searchQuery, sortBy, page, limit);
  }, [fetchProblems, updateUrl, selectedDifficulties, selectedCompany, searchQuery, sortBy, page, limit]);

  const toggleDifficulty = (diff: string) => {
    setPage(1);
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const handleCompanyChange = (c: string) => {
    setPage(1);
    setSelectedCompany(c);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearchQuery(e.target.value);
  };

  const resetAllFilters = () => {
    setSelectedDifficulties([]);
    setSelectedCompany('ALL');
    setSearchQuery('');
    setSortBy('accuracy-desc');
    setPage(1);
  };

  const solvedForThisPattern = Object.keys(solvedMap).filter(
    (k) => k.startsWith(`pattern_${slug}_`) && solvedMap[k]
  ).length;

  const categoryTitle = overview?.category || slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="space-y-4 sm:space-y-5 font-mono text-xs text-[#4ade80] w-full">
      {/* Breadcrumb & Pattern Header Console */}
      <div className="border border-[#233823] bg-[#151c15] p-4 sm:p-5 space-y-3 rounded-sm shadow-xl">
        <div className="flex items-center justify-between text-xs text-[#86a789] border-b border-[#233823] pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-[#4ade80] transition-colors font-bold">
              [LEETCAMP]
            </Link>
            <span>/</span>
            <Link href="/patterns" className="hover:text-[#4ade80] transition-colors font-bold">
              [DSA PATTERNS]
            </Link>
            <span>/</span>
            <span className="text-[#4ade80] font-bold">{categoryTitle}</span>
          </div>
          <Link
            href="/patterns"
            className="px-2 py-0.5 border border-[#233823] hover:bg-[#4ade80] hover:text-[#111611] transition-colors shrink-0 font-bold rounded-sm"
          >
            [← CD ..]
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111611] border border-[#233823] text-[#38bdf8] flex items-center justify-center font-arcade text-sm font-bold shrink-0 rounded-sm">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#4ade80] tracking-tight">
                  {categoryTitle}
                </h1>
                <span className="px-2 py-0.5 text-xs bg-[#111611] text-[#fbbf24] border border-[#233823] font-bold rounded-sm">
                  [{totalCount} CURATED QUESTIONS]
                </span>
              </div>
              <p className="text-xs text-[#86a789] mt-0.5 leading-relaxed">
                ROADMAP PILLAR: <strong className="text-[#4ade80]">{overview?.group || 'DATA STRUCTURES'}</strong> · ACCURACY: <strong className="text-[#38bdf8]">{overview?.stats?.avgAccuracy || '--'}%</strong>
              </p>
            </div>
          </div>

          {/* Solved Counter Ribbon */}
          <div className="flex items-center gap-2 bg-[#111611] border border-[#233823] px-3 py-1.5 shrink-0 rounded-sm">
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
            <div className="text-xs">
              <span className="text-[#86a789]">PROGRESS: </span>
              <strong className="text-[#4ade80]">{solvedForThisPattern}</strong>
              <span className="text-[#86a789]">/{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Ribbon */}
        {overview?.stats && (
          <div className="pt-2 border-t border-[#233823] flex flex-wrap items-center gap-3 text-xs text-[#86a789] font-mono">
            <span>DISTRIBUTION:</span>
            {overview.stats.basic > 0 && (
              <span className="text-[#38bdf8] font-bold">
                BASIC: {overview.stats.basic}
              </span>
            )}
            <span className="text-[#4ade80] font-bold">
              EASY: {overview.stats.easy}
            </span>
            <span className="text-[#fbbf24] font-bold">
              MEDIUM: {overview.stats.medium}
            </span>
            <span className="text-[#f87171] font-bold">
              HARD: {overview.stats.hard}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Filter Control Panel */}
      <div className="border border-[#233823] bg-[#151c15] p-3 sm:p-4 space-y-3 rounded-sm shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
          {/* Difficulty Toggles (Basic, Easy, Medium, Hard) */}
          <div className="lg:col-span-4 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ DIFFICULTY_FLAGS (4 TIERS) ]
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleDifficulty('Basic')}
                className={`flex-1 py-1 px-1.5 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Basic')
                    ? 'bg-[#38bdf8] text-[#111611] border-[#38bdf8] font-bold'
                    : 'bg-[#111611] text-[#38bdf8] border-[#233823] hover:border-[#38bdf8]'
                }`}
              >
                [--BASIC]
              </button>
              <button
                onClick={() => toggleDifficulty('Easy')}
                className={`flex-1 py-1 px-1.5 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Easy')
                    ? 'bg-[#4ade80] text-[#111611] border-[#4ade80] font-bold'
                    : 'bg-[#111611] text-[#4ade80] border-[#233823] hover:border-[#4ade80]'
                }`}
              >
                [--EASY]
              </button>
              <button
                onClick={() => toggleDifficulty('Medium')}
                className={`flex-1 py-1 px-1.5 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Medium')
                    ? 'bg-[#fbbf24] text-[#111611] border-[#fbbf24] font-bold'
                    : 'bg-[#111611] text-[#fbbf24] border-[#233823] hover:border-[#fbbf24]'
                }`}
              >
                [--MED]
              </button>
              <button
                onClick={() => toggleDifficulty('Hard')}
                className={`flex-1 py-1 px-1.5 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Hard')
                    ? 'bg-[#f87171] text-[#111611] border-[#f87171] font-bold'
                    : 'bg-[#111611] text-[#f87171] border-[#233823] hover:border-[#f87171]'
                }`}
              >
                [--HARD]
              </button>
            </div>
          </div>

          {/* Company Tag Filter */}
          <div className="lg:col-span-3 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ COMPANY_TAG ]
            </span>
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full bg-[#111611] border border-[#233823] focus:border-[#4ade80] text-[#4ade80] text-xs px-2 py-1 cursor-pointer font-mono outline-none rounded-sm"
            >
              <option value="ALL">-- ALL COMPANIES --</option>
              {overview?.companies?.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-3 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ GREP_TITLE ]
            </span>
            <div className="flex items-center bg-[#111611] border border-[#233823] focus-within:border-[#4ade80] px-2.5 py-1 rounded-sm">
              <span className="text-[#4ade80] font-bold mr-1.5">&gt;</span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="grep problem title..."
                className="w-full bg-transparent text-[#4ade80] placeholder-[#5e7e61] text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="lg:col-span-2 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ SORT ]
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value);
              }}
              className="w-full bg-[#111611] border border-[#233823] focus:border-[#4ade80] text-[#4ade80] text-xs px-2 py-1 cursor-pointer font-mono outline-none rounded-sm"
            >
              <option value="accuracy-desc">ACCURACY (HIGH ▼)</option>
              <option value="accuracy-asc">ACCURACY (LOW ▲)</option>
              <option value="title-asc">TITLE (A → Z)</option>
              <option value="title-desc">TITLE (Z → A)</option>
              <option value="difficulty-asc">DIFF (BASIC → HARD)</option>
              <option value="difficulty-desc">DIFF (HARD → BASIC)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-[#86a789] px-1">
        <span>
          MATCHING: <strong className="text-[#4ade80]">{totalCount}</strong> PROBLEMS
        </span>
        <span>
          PAGE {page} OF {totalPages}
        </span>
      </div>

      {/* Problems Table View */}
      <div className="border border-[#233823] bg-[#151c15] overflow-x-auto shadow-2xl rounded-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#86a789] font-mono space-y-2">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[#4ade80] border-t-transparent rounded-full" />
            <p className="tracking-wider">QUERYING_SQLITE_ARCHIVE...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#f87171] space-y-3">
            <p>ERROR: {error}</p>
            <button
              onClick={fetchProblems}
              className="px-3 py-1 bg-[#f87171] text-[#111611] font-bold rounded-sm"
            >
              [RETRY]
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#86a789] space-y-3">
            <p className="text-[#fbbf24]">NO PROBLEMS MATCHING CURRENT FILTERS</p>
            <button
              onClick={resetAllFilters}
              className="px-3 py-1 bg-[#4ade80] text-[#111611] font-bold rounded-sm"
            >
              [CLEAR FILTERS]
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#233823] bg-[#111611] text-[#86a789] select-none text-[11px]">
                <th className="py-3 px-3 w-12 text-center font-bold">STATUS</th>
                <th className="py-3 px-3 w-12 text-center font-bold">#</th>
                <th className="py-3 px-3 font-bold">PROBLEM TITLE</th>
                <th className="py-3 px-3 w-28 text-center font-bold">DIFFICULTY</th>
                <th className="py-3 px-3 w-28 text-center font-bold">ACCURACY</th>
                <th className="py-3 px-3 font-bold hidden md:table-cell">COMPANY TAGS</th>
                <th className="py-3 px-3 w-24 text-center font-bold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233823]">
              {problems.map((prob, idx) => {
                const globalIdx = (page - 1) * limit + idx + 1;
                const key = `pattern_${slug}_${prob.id}_${prob.title}`;
                const isSolved = !!solvedMap[key];

                let diffColor = 'text-[#4ade80] border-[#4ade80]/40 bg-[#111611]';
                if (prob.difficulty === 'Basic') diffColor = 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#111611]';
                if (prob.difficulty === 'Medium') diffColor = 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#111611]';
                if (prob.difficulty === 'Hard') diffColor = 'text-[#f87171] border-[#f87171]/40 bg-[#111611]';

                const companyList = prob.company_tags
                  ? prob.company_tags.split(',').map((c) => c.replace(/\+\d+/, '').trim()).filter(Boolean)
                  : [];

                return (
                  <tr
                    key={prob.id}
                    className={`hover:bg-[#1b261b] transition-colors group ${
                      isSolved ? 'bg-[#151c15]/60 opacity-80' : ''
                    }`}
                  >
                    {/* Status Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleSolved(prob.id, prob.title)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                        title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                      >
                        {isSolved ? (
                          <CheckSquare className="w-4 h-4 text-[#4ade80] inline-block" />
                        ) : (
                          <Square className="w-4 h-4 text-[#86a789] hover:text-[#4ade80] inline-block" />
                        )}
                      </button>
                    </td>

                    {/* Row Index */}
                    <td className="py-3 px-3 text-center text-[#86a789] text-[11px]">
                      {globalIdx}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline flex items-center gap-1.5 font-bold ${
                          isSolved ? 'text-[#86a789] line-through' : 'text-[#4ade80]'
                        }`}
                      >
                        <span>{prob.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#86a789] group-hover:text-[#4ade80] inline-block shrink-0" />
                      </a>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border inline-block rounded-sm ${diffColor}`}>
                        {prob.difficulty.toUpperCase()}
                      </span>
                    </td>

                    {/* Accuracy Percentage */}
                    <td className="py-3 px-3 text-center">
                      {prob.accuracy !== null ? (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-[#86a789]">
                            {prob.accuracy}%
                          </span>
                          <div className="w-16 mx-auto h-1 bg-[#111611] border border-[#233823] overflow-hidden rounded-sm">
                            <div
                              style={{ width: `${Math.min(100, prob.accuracy)}%` }}
                              className="bg-[#38bdf8] h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#86a789]">-</span>
                      )}
                    </td>

                    {/* Company Tags */}
                    <td className="py-3 px-3 hidden md:table-cell">
                      {companyList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {companyList.slice(0, 3).map((comp) => (
                            <Link
                              key={comp}
                              href={`/company/${encodeURIComponent(comp)}`}
                              className="px-1.5 py-0.5 text-[10px] border border-[#233823] bg-[#111611] text-[#86a789] hover:border-[#4ade80] hover:text-[#4ade80] transition-colors rounded-sm"
                            >
                              {comp}
                            </Link>
                          ))}
                          {companyList.length > 3 && (
                            <span className="text-[10px] text-[#5e7e61] px-1 py-0.5">
                              +{companyList.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#5e7e61] text-[10px]">--</span>
                      )}
                    </td>

                    {/* Direct Solve Link */}
                    <td className="py-3 px-3 text-center">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[#233823] bg-[#111611] text-[#4ade80] hover:bg-[#4ade80] hover:text-[#111611] font-bold transition-all rounded-sm"
                      >
                        <span>[SOLVE]</span>
                        <ExternalLink className="w-3 h-3" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#233823] bg-[#151c15] p-3 rounded-sm">
          <div className="flex items-center gap-2 text-xs text-[#86a789]">
            <span>ROWS PER PAGE:</span>
            <select
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(parseInt(e.target.value, 10));
              }}
              className="bg-[#111611] border border-[#233823] text-[#4ade80] px-2 py-1 text-xs outline-none cursor-pointer rounded-sm"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-2 py-1 border border-[#233823] text-xs text-[#86a789] disabled:opacity-30 hover:bg-[#1b261b] hover:text-[#4ade80] transition-colors rounded-sm"
            >
              [|&lt; FIRST]
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2 py-1 border border-[#233823] text-xs text-[#86a789] disabled:opacity-30 hover:bg-[#1b261b] hover:text-[#4ade80] transition-colors rounded-sm"
            >
              [&lt; PREV]
            </button>

            <span className="px-3 py-1 text-xs text-[#4ade80] font-bold border border-[#233823] bg-[#111611] rounded-sm">
              PAGE {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 py-1 border border-[#233823] text-xs text-[#86a789] disabled:opacity-30 hover:bg-[#1b261b] hover:text-[#4ade80] transition-colors rounded-sm"
            >
              [NEXT &gt;]
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="px-2 py-1 border border-[#233823] text-xs text-[#86a789] disabled:opacity-30 hover:bg-[#1b261b] hover:text-[#4ade80] transition-colors rounded-sm"
            >
              [LAST &gt;|]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
