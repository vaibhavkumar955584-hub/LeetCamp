'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AlertCircle, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Problem } from '@/lib/db';

interface ProblemExplorerProps {
  company: string;
  initialData?: {
    problems: Problem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    overview?: any;
  };
}

const TIMEFRAME_TABS = [
  { id: 'all_time', label: '--all-time' },
  { id: '30_days', label: '--30d' },
  { id: '90_days', label: '--90d' },
  { id: '6_months', label: '--6m' },
  { id: 'more_than_six_months', label: '--more-6m' },
];

export function ProblemExplorer({ company, initialData }: ProblemExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial states from URL params if available, else fallback
  const initialTimeframe = searchParams.get('timeframe') || 'all_time';
  const initialDifficulty = searchParams.get('difficulty') 
    ? searchParams.get('difficulty')!.split(',').map((d) => d.trim()).filter(Boolean) 
    : [];
  const initialSearch = searchParams.get('search') || '';
  const initialTopic = searchParams.get('topic') || 'ALL';
  const initialSort = searchParams.get('sort') || 'frequency';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialLimit = parseInt(searchParams.get('limit') || '50', 10) || 50;

  const [problems, setProblems] = useState<Problem[]>(initialData?.problems || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  // NOTE (BUG 4 ARCHITECTURE): Company-wise LeetCode problems natively contain 3 difficulty tiers (Easy, Medium, Hard).
  // The 4th 'Basic' tier applies exclusively to the curated DSA Patterns collection.
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(initialDifficulty);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(initialTimeframe);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Pagination States
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalCount, setTotalCount] = useState(initialData?.pagination?.total || 0);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);

  const [availableTopics, setAvailableTopics] = useState<string[]>(['ALL']);
  const [companyPatterns, setCompanyPatterns] = useState<any[]>([]);

  // Fetch full company topics list & pattern questions on mount
  useEffect(() => {
    async function loadTopicsAndPatterns() {
      try {
        const [topRes, patRes] = await Promise.all([
          fetch(`/api/companies/${encodeURIComponent(company)}/topics`),
          fetch(`/api/companies/${encodeURIComponent(company)}/patterns`),
        ]);

        if (topRes.ok) {
          const data = await topRes.json();
          if (Array.isArray(data.topics)) {
            setAvailableTopics(['ALL', ...data.topics]);
          }
        }

        if (patRes.ok) {
          const patData = await patRes.json();
          if (Array.isArray(patData.problems)) {
            setCompanyPatterns(patData.problems);
          }
        }
      } catch (err) {
        console.error('Failed to load company topics/patterns:', err);
      }
    }

    loadTopicsAndPatterns();
  }, [company]);

  // Synchronize state with URL search params (shallow replace)
  const updateUrl = useCallback(
    (
      diffs: string[],
      tf: string,
      search: string,
      topic: string,
      sort: string,
      currPage: number,
      currLimit: number
    ) => {
      const params = new URLSearchParams();
      if (diffs.length > 0) params.set('difficulty', diffs.join(','));
      if (tf !== 'all_time') params.set('timeframe', tf);
      if (search.trim()) params.set('search', search.trim());
      if (topic !== 'ALL') params.set('topic', topic);
      if (sort !== 'frequency') params.set('sort', sort);
      if (currPage > 1) params.set('page', currPage.toString());
      if (currLimit !== 50) params.set('limit', currLimit.toString());

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch problems with debounce / memoized parameters
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulties.length > 0) params.set('difficulty', selectedDifficulties.join(','));
      if (selectedTimeframe) params.set('timeframe', selectedTimeframe);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedTopic && selectedTopic !== 'ALL') params.set('topic', selectedTopic);
      if (sortBy) params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(
        `/api/companies/${encodeURIComponent(company)}/problems?${params.toString()}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to load problem data.`);
      }

      const data = await res.json();
      setProblems(data.problems || []);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching problems:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [company, selectedDifficulties, selectedTimeframe, searchQuery, selectedTopic, sortBy, page, limit]);

  // Refetch & update URL whenever filter states change
  useEffect(() => {
    fetchProblems();
    updateUrl(selectedDifficulties, selectedTimeframe, searchQuery, selectedTopic, sortBy, page, limit);
  }, [fetchProblems, updateUrl, selectedDifficulties, selectedTimeframe, searchQuery, selectedTopic, sortBy, page, limit]);

  const toggleDifficulty = (diff: string) => {
    setPage(1);
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const handleTimeframeChange = (tf: string) => {
    setPage(1);
    setSelectedTimeframe(tf);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearchQuery(e.target.value);
  };

  const handleTopicChange = (newTopic: string) => {
    setPage(1);
    setSelectedTopic(newTopic);
  };

  // Sortable column header toggle
  const handleSortHeader = (column: 'title' | 'difficulty' | 'acceptance' | 'frequency') => {
    setPage(1);
    if (column === 'title') {
      setSortBy((prev) => (prev === 'title-asc' ? 'title-desc' : 'title-asc'));
    } else if (column === 'difficulty') {
      setSortBy((prev) => (prev === 'difficulty-asc' ? 'difficulty-desc' : 'difficulty-asc'));
    } else if (column === 'acceptance') {
      setSortBy((prev) => (prev === 'acceptance-desc' ? 'acceptance-asc' : 'acceptance-desc'));
    } else if (column === 'frequency') {
      setSortBy((prev) => (prev === 'frequency' || prev === 'frequency-desc' ? 'frequency-asc' : 'frequency-desc'));
    }
  };

  const resetFilters = () => {
    setSelectedDifficulties([]);
    setSelectedTimeframe('all_time');
    setSearchQuery('');
    setSelectedTopic('ALL');
    setSortBy('frequency');
    setPage(1);
  };

  const hasActiveFilters =
    selectedDifficulties.length > 0 ||
    selectedTimeframe !== 'all_time' ||
    searchQuery.trim() !== '' ||
    selectedTopic !== 'ALL' ||
    sortBy !== 'frequency';

  const formatAcceptance = (rate: number | null) => {
    if (rate === null || rate === undefined || isNaN(rate)) return '—';
    const pct = rate <= 0.1 ? rate * 10000 : rate <= 1 ? rate * 100 : rate;
    return `${pct.toFixed(1)}%`;
  };

  // Render sort icon on column headers
  const renderSortIndicator = (column: string) => {
    if (column === 'title') {
      if (sortBy === 'title-asc') return <span className="text-[#4ade80] font-bold">[▲]</span>;
      if (sortBy === 'title-desc') return <span className="text-[#4ade80] font-bold">[▼]</span>;
    } else if (column === 'difficulty') {
      if (sortBy === 'difficulty-asc') return <span className="text-[#4ade80] font-bold">[▲]</span>;
      if (sortBy === 'difficulty-desc') return <span className="text-[#4ade80] font-bold">[▼]</span>;
    } else if (column === 'acceptance') {
      if (sortBy === 'acceptance-desc') return <span className="text-[#4ade80] font-bold">[▼]</span>;
      if (sortBy === 'acceptance-asc') return <span className="text-[#4ade80] font-bold">[▲]</span>;
    } else if (column === 'frequency') {
      if (sortBy === 'frequency' || sortBy === 'frequency-desc') return <span className="text-[#4ade80] font-bold">[▼]</span>;
      if (sortBy === 'frequency-asc') return <span className="text-[#4ade80] font-bold">[▲]</span>;
    }
    return <span className="text-[#86a789] opacity-40 group-hover:opacity-100">[↕]</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-5 font-mono text-xs text-[#4ade80] w-full">
      {/* Navigation Breadcrumb & Terminal Title Frame */}
      <div className="border border-[#233823] bg-[#151c15] p-4 sm:p-5 space-y-3 rounded-sm">
        <div className="flex items-center justify-between text-xs text-[#86a789] border-b border-[#233823] pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-[#4ade80] transition-colors font-bold">
              [LEETCAMP]
            </Link>
            <span>/</span>
            <span>ORGANIZATIONS</span>
            <span>/</span>
            <span className="text-[#4ade80] font-bold">{company.toUpperCase()}.SYS</span>
          </div>
          <Link
            href="/"
            className="px-2 py-0.5 border border-[#233823] hover:bg-[#4ade80] hover:text-[#111611] transition-colors shrink-0 font-bold rounded-sm"
          >
            [← CD ..]
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111611] border border-[#233823] text-[#4ade80] flex items-center justify-center font-arcade text-sm font-bold shrink-0 rounded-sm">
              ▓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#4ade80] tracking-tight">
                  {company.toUpperCase()}.SYS
                </h1>
                <span className="px-2 py-0.5 text-xs bg-[#111611] text-[#fbbf24] border border-[#233823] font-bold rounded-sm">
                  [{totalCount} QUESTIONS]
                </span>
              </div>
              <p className="text-xs text-[#86a789] mt-0.5 leading-relaxed">
                INTERVIEW QUESTION DATABASE // FREQUENCY RANKINGS
              </p>
            </div>
          </div>

          <div className="text-xs text-[#86a789] font-mono font-bold">
            SYS_MODE: [INSPECT]
          </div>
        </div>

        {/* DSA Pattern Cross-link Banner if company questions exist */}
        {companyPatterns.length > 0 && (
          <div className="pt-2 border-t border-[#233823] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-[#111611] p-2.5 border border-[#233823] rounded-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#fbbf24] font-arcade text-[10px]">
                ★ [DSA PATTERNS]
              </span>
              <span className="text-[#4ade80] font-bold">
                {companyPatterns.length} CURATED QUESTIONS TAGGED FOR {company.toUpperCase()}
              </span>
              <span className="text-[#86a789] hidden md:inline">
                ({Array.from(new Set(companyPatterns.map((p: any) => p.category))).slice(0, 3).join(', ')}...)
              </span>
            </div>
            <Link
              href={`/patterns`}
              className="px-2.5 py-1 bg-[#4ade80] text-[#111611] font-bold hover:bg-white transition-colors shrink-0 text-center rounded-sm"
            >
              [BROWSE DSA PATTERNS →]
            </Link>
          </div>
        )}
      </div>

      {/* Filter Control Terminal */}
      <div className="border border-[#233823] bg-[#151c15] p-3 sm:p-4 space-y-3 rounded-sm">
        {/* Timeframe CLI Switches */}
        <div className="space-y-1.5">
          <span className="text-xs text-[#86a789] uppercase font-bold tracking-wider">
            [ TIMEFRAME_WINDOW ]
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TIMEFRAME_TABS.map((tab) => {
              const active = selectedTimeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTimeframeChange(tab.id)}
                  className={`px-2.5 py-1 text-xs border transition-colors rounded-sm ${
                    active
                      ? 'bg-[#4ade80] text-[#111611] border-[#4ade80] font-bold'
                      : 'bg-[#111611] text-[#86a789] border-[#233823] hover:text-[#4ade80] hover:border-[#4ade80]'
                  }`}
                >
                  [{tab.label}]
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Console */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-3 border-t border-[#233823]">
          {/* Difficulty Switches (3 Tiers for LeetCode company dataset: Easy, Medium, Hard) */}
          <div className="lg:col-span-4 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ DIFFICULTY_FLAGS ]
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleDifficulty('Easy')}
                className={`flex-1 py-1 px-2 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Easy')
                    ? 'bg-[#4ade80] text-[#111611] border-[#4ade80] font-bold'
                    : 'bg-[#111611] text-[#4ade80] border-[#233823] hover:border-[#4ade80]'
                }`}
              >
                [--EASY]
              </button>
              <button
                onClick={() => toggleDifficulty('Medium')}
                className={`flex-1 py-1 px-2 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Medium')
                    ? 'bg-[#fbbf24] text-[#111611] border-[#fbbf24] font-bold'
                    : 'bg-[#111611] text-[#fbbf24] border-[#233823] hover:border-[#fbbf24]'
                }`}
              >
                [--MED]
              </button>
              <button
                onClick={() => toggleDifficulty('Hard')}
                className={`flex-1 py-1 px-2 border text-xs transition-colors rounded-sm ${
                  selectedDifficulties.includes('Hard')
                    ? 'bg-[#f87171] text-[#111611] border-[#f87171] font-bold'
                    : 'bg-[#111611] text-[#f87171] border-[#233823] hover:border-[#f87171]'
                }`}
              >
                [--HARD]
              </button>
            </div>
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
                placeholder="grep title..."
                className="w-full bg-transparent text-[#4ade80] placeholder-[#5e7e61] text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Topic Select */}
          <div className="lg:col-span-3 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ TOPIC_TAG ]
            </span>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full bg-[#111611] border border-[#233823] focus:border-[#4ade80] text-[#4ade80] text-xs px-2 py-1 cursor-pointer font-mono outline-none rounded-sm"
            >
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === 'ALL' ? '--all-topics' : topic}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="lg:col-span-2 space-y-1">
            <span className="text-xs text-[#86a789] uppercase font-bold">
              [ ORDER_BY ]
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value);
              }}
              className="w-full bg-[#111611] border border-[#233823] focus:border-[#4ade80] text-[#4ade80] text-xs px-2 py-1 cursor-pointer font-mono outline-none rounded-sm"
            >
              <option value="frequency">FREQ (HIGH ▼)</option>
              <option value="frequency-asc">FREQ (LOW ▲)</option>
              <option value="title-asc">TITLE (A → Z)</option>
              <option value="title-desc">TITLE (Z → A)</option>
              <option value="difficulty-asc">DIFF (EASY → HARD)</option>
              <option value="difficulty-desc">DIFF (HARD → EASY)</option>
              <option value="acceptance-desc">ACCEPT (HIGH ▼)</option>
              <option value="acceptance-asc">ACCEPT (LOW ▲)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#233823] text-xs text-[#86a789]">
            <div>
              FLAGS_ACTIVE: {selectedTimeframe !== 'all_time' && `[${selectedTimeframe}] `} {selectedDifficulties.length > 0 && `[${selectedDifficulties.join('+')}] `} {searchQuery && `grep("${searchQuery}") `} {selectedTopic !== 'ALL' && `tag("${selectedTopic}") `}
            </div>
            <button
              onClick={resetFilters}
              className="text-[#f87171] hover:underline font-bold"
            >
              [CLEAR_ALL]
            </button>
          </div>
        )}
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

      {/* Problems Table View (Breathable row padding & comfortable contrast) */}
      <div className="border border-[#233823] bg-[#151c15] overflow-x-auto shadow-2xl rounded-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#86a789] font-mono space-y-2">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-[#4ade80] border-t-transparent rounded-full" />
            <p className="tracking-wider">QUERYING_SQLITE_ARCHIVE...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#f87171] space-y-3">
            <AlertCircle className="w-6 h-6 mx-auto text-[#f87171]" />
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
            <p className="text-[#fbbf24]">NO PROBLEMS FOUND MATCHING CRITERIA</p>
            <button
              onClick={resetFilters}
              className="px-3 py-1 bg-[#4ade80] text-[#111611] font-bold rounded-sm"
            >
              [RESET ALL FILTERS]
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#233823] bg-[#111611] text-[#86a789] select-none text-[11px]">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th 
                  onClick={() => handleSortHeader('title')}
                  className="py-3 px-3 cursor-pointer hover:text-[#4ade80] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>TITLE</span>
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSortHeader('difficulty')}
                  className="py-3 px-3 w-28 cursor-pointer hover:text-[#4ade80] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>DIFFICULTY</span>
                    {renderSortIndicator('difficulty')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSortHeader('acceptance')}
                  className="py-3 px-3 w-24 text-right cursor-pointer hover:text-[#4ade80] transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>ACCEPT%</span>
                    {renderSortIndicator('acceptance')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSortHeader('frequency')}
                  className="py-3 px-3 w-36 cursor-pointer hover:text-[#4ade80] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>FREQ_SCORE</span>
                    {renderSortIndicator('frequency')}
                  </div>
                </th>
                <th className="py-3 px-3">TOPICS</th>
                <th className="py-3 px-3 w-24 text-center">EXECUTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233823]">
              {problems.map((prob, idx) => {
                const rowNumber = (page - 1) * limit + idx + 1;
                const isEasy = prob.difficulty === 'Easy';
                const isMed = prob.difficulty === 'Medium';

                return (
                  <tr
                    key={`${prob.id}-${prob.slug}`}
                    className="hover:bg-[#1b261b] hover:text-white transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-[#86a789] group-hover:text-white font-mono text-xs">
                      {rowNumber.toString().padStart(3, '0')}
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={prob.leetcode_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#4ade80] group-hover:text-white inline-flex items-center gap-1.5 text-sm"
                      >
                        <span>{prob.title}</span>
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 text-xs font-bold border rounded-sm ${
                          isEasy
                            ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#111611]'
                            : isMed
                            ? 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#111611]'
                            : 'text-[#f87171] border-[#f87171]/40 bg-[#111611]'
                        }`}
                      >
                        {prob.difficulty.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono group-hover:text-white text-xs sm:text-sm font-bold">
                      {formatAcceptance(prob.acceptance)}
                    </td>
                    <td className="py-3 px-3">
                      {prob.frequency !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-mono font-bold">
                            {prob.frequency.toFixed(1)}%
                          </span>
                          <span className="text-xs text-[#86a789]">
                            {'█'.repeat(Math.round(prob.frequency / 20))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#86a789]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {prob.topics ? (
                        <div className="flex flex-wrap gap-1">
                          {prob.topics.split(',').slice(0, 4).map((topic, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 text-xs border border-[#233823] bg-[#111611] text-[#86a789] rounded-sm"
                            >
                              {topic.trim()}
                            </span>
                          ))}
                          {prob.topics.split(',').length > 4 && (
                            <span className="text-xs text-[#86a789]">
                              +{prob.topics.split(',').length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#86a789]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <a
                        href={prob.leetcode_url}
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
