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
  CheckSquare,
  Square,
  ArrowLeft,
  Layers
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

  const categoryTitle = overview?.category || slug.replace(/-/g, ' ');

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header Surface */}
      <div className="data-surface p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <Link href="/patterns" className="hover:text-[var(--text-primary)] transition-colors font-medium">
              DSA Patterns
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-semibold">{categoryTitle}</span>
          </div>
          <Link
            href="/patterns"
            className="btn-primary py-1 px-2.5 text-xs"
          >
            <ArrowLeft size={13} />
            <span>All Patterns</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {categoryTitle}
              </h1>
              <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] mono font-semibold">
                {totalCount} Problems
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Pillar: <strong className="text-[var(--text-primary)] font-semibold">{overview?.group || 'Data Structures'}</strong> {overview?.stats?.avgAccuracy ? `· Average Accuracy: ${overview.stats.avgAccuracy}%` : ''}
            </p>
          </div>

          {/* Solved Counter Ribbon */}
          <div className="flex items-center gap-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] px-3.5 py-2 rounded-[var(--radius-md)] shrink-0">
            <CheckCircle2 size={16} className="text-[var(--accent-green)]" />
            <div className="text-xs">
              <span className="text-[var(--text-muted)]">Progress: </span>
              <strong className="text-[var(--text-primary)] mono font-bold">{solvedForThisPattern}</strong>
              <span className="text-[var(--text-muted)] mono">/{totalCount} Solved</span>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Ribbon */}
        {overview?.stats && (
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-3 text-xs">
            <span className="label-caps">Distribution:</span>
            {overview.stats.basic > 0 && <span className="chip chip-basic">{overview.stats.basic} Basic</span>}
            <span className="chip chip-easy">{overview.stats.easy} Easy</span>
            <span className="chip chip-medium">{overview.stats.medium} Med</span>
            <span className="chip chip-hard">{overview.stats.hard} Hard</span>
          </div>
        )}
      </div>

      {/* Control Console Toolbar */}
      <div className="data-surface p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Difficulty Toggles (Basic, Easy, Medium, Hard) */}
          <div className="lg:col-span-4 space-y-1.5">
            <span className="label-caps block">Difficulty Tiers</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleDifficulty('Basic')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-[var(--radius-sm)] transition-all border ${
                  selectedDifficulties.includes('Basic')
                    ? 'bg-[var(--diff-basic)] text-[#0e0f12] font-semibold border-[var(--diff-basic)]'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--diff-basic)] border-[var(--border-subtle)] hover:border-[var(--diff-basic)]'
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => toggleDifficulty('Easy')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-[var(--radius-sm)] transition-all border ${
                  selectedDifficulties.includes('Easy')
                    ? 'bg-[var(--diff-easy)] text-[#0e0f12] font-semibold border-[var(--diff-easy)]'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--diff-easy)] border-[var(--border-subtle)] hover:border-[var(--diff-easy)]'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => toggleDifficulty('Medium')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-[var(--radius-sm)] transition-all border ${
                  selectedDifficulties.includes('Medium')
                    ? 'bg-[var(--diff-medium)] text-[#0e0f12] font-semibold border-[var(--diff-medium)]'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--diff-medium)] border-[var(--border-subtle)] hover:border-[var(--diff-medium)]'
                }`}
              >
                Med
              </button>
              <button
                onClick={() => toggleDifficulty('Hard')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-[var(--radius-sm)] transition-all border ${
                  selectedDifficulties.includes('Hard')
                    ? 'bg-[var(--diff-hard)] text-[#0e0f12] font-semibold border-[var(--diff-hard)]'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--diff-hard)] border-[var(--border-subtle)] hover:border-[var(--diff-hard)]'
                }`}
              >
                Hard
              </button>
            </div>
          </div>

          {/* Company Tag Filter */}
          <div className="lg:col-span-3 space-y-1.5">
            <span className="label-caps block">Company Tag</span>
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] text-xs px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer outline-none"
            >
              <option value="ALL">All Companies</option>
              {overview?.companies?.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-3 space-y-1.5">
            <span className="label-caps block">Search Problems</span>
            <div className="flex items-center bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus-within:border-[var(--accent-green)] px-3 py-1.5 rounded-[var(--radius-sm)]">
              <Search size={14} className="text-[var(--text-muted)] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search problem title..."
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="lg:col-span-2 space-y-1.5">
            <span className="label-caps block">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value);
              }}
              className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] text-xs px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer outline-none"
            >
              <option value="accuracy-desc">Accuracy (High → Low)</option>
              <option value="accuracy-asc">Accuracy (Low → High)</option>
              <option value="title-asc">Title (A → Z)</option>
              <option value="title-desc">Title (Z → A)</option>
              <option value="difficulty-asc">Difficulty (Basic → Hard)</option>
              <option value="difficulty-desc">Difficulty (Hard → Basic)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mono px-1">
        <span>
          Showing <strong className="text-[var(--text-primary)]">{problems.length}</strong> of {totalCount} matching problems
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Problems Data Table */}
      <div className="data-surface overflow-x-auto shadow-md">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[var(--accent-green)] border-t-transparent rounded-full" />
            <p>Loading pattern problems...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[var(--diff-hard)] space-y-3">
            <p>Error: {error}</p>
            <button
              onClick={fetchProblems}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-3">
            <p className="text-[var(--text-secondary)] text-sm">No problems match current filters</p>
            <button
              onClick={resetAllFilters}
              className="btn-primary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-muted)] label-caps select-none">
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-4 w-28 text-center">Difficulty</th>
                <th className="py-3 px-4 w-28 text-center">Accuracy</th>
                <th className="py-3 px-4 hidden md:table-cell">Company Tags</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {problems.map((prob, idx) => {
                const globalIdx = (page - 1) * limit + idx + 1;
                const key = `pattern_${slug}_${prob.id}_${prob.title}`;
                const isSolved = !!solvedMap[key];

                const companyList = prob.company_tags
                  ? prob.company_tags.split(',').map((c) => c.replace(/\+\d+/, '').trim()).filter(Boolean)
                  : [];

                return (
                  <tr
                    key={prob.id}
                    className={`hover:bg-[var(--bg-hover)] transition-colors group ${
                      isSolved ? 'opacity-70 bg-[var(--bg-surface-raised)]/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleSolved(prob.id, prob.title)}
                        className="hover:scale-110 transition-transform focus:outline-none"
                        title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                      >
                        {isSolved ? (
                          <CheckSquare size={16} className="text-[var(--accent-green)] inline-block" />
                        ) : (
                          <Square size={16} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-block" />
                        )}
                      </button>
                    </td>

                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-[var(--text-muted)] mono">
                      {globalIdx}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:text-[var(--accent-green)] transition-colors flex items-center gap-1.5 font-medium ${
                          isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        <span>{prob.title}</span>
                        <ExternalLink size={12} className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)] inline-block shrink-0" />
                      </a>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {prob.difficulty === 'Basic' && <span className="chip chip-basic">Basic</span>}
                      {prob.difficulty === 'Easy' && <span className="chip chip-easy">Easy</span>}
                      {prob.difficulty === 'Medium' && <span className="chip chip-medium">Medium</span>}
                      {prob.difficulty === 'Hard' && <span className="chip chip-hard">Hard</span>}
                    </td>

                    {/* Accuracy */}
                    <td className="py-3.5 px-4 text-center">
                      {prob.accuracy !== null ? (
                        <div className="space-y-1">
                          <span className="mono font-semibold text-[var(--text-primary)]">
                            {prob.accuracy}%
                          </span>
                          <div className="w-14 mx-auto h-1.5 rounded-full overflow-hidden bg-[var(--bg-surface-raised)]">
                            <div
                              style={{ width: `${Math.min(100, prob.accuracy)}%` }}
                              className="bg-[var(--diff-basic)] h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* Company Tags */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      {companyList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {companyList.slice(0, 3).map((comp) => (
                            <Link
                              key={comp}
                              href={`/company/${encodeURIComponent(comp)}`}
                              className="px-2 py-0.5 text-[11px] rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-green)] hover:text-[var(--text-primary)] transition-colors"
                            >
                              {comp}
                            </Link>
                          ))}
                          {companyList.length > 3 && (
                            <span className="text-[11px] text-[var(--text-muted)] px-1 py-0.5">
                              +{companyList.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-1 px-2.5 text-xs text-[var(--accent-green)] hover:border-[var(--accent-green)]"
                      >
                        <span>Solve</span>
                        <ExternalLink size={12} />
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
        <div className="data-surface flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(parseInt(e.target.value, 10));
              }}
              className="bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] px-2.5 py-1 text-xs rounded-[var(--radius-sm)] outline-none cursor-pointer"
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
              className="btn-primary py-1 px-2.5 text-xs disabled:opacity-40"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-primary py-1 px-2.5 text-xs disabled:opacity-40"
            >
              Prev
            </button>

            <span className="px-3 py-1 text-xs text-[var(--text-primary)] font-semibold mono">
              {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-primary py-1 px-2.5 text-xs disabled:opacity-40"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="btn-primary py-1 px-2.5 text-xs disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
