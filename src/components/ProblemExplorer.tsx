'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
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

  // Fetch full company topics list on mount
  useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetch(`/api/companies/${encodeURIComponent(company)}/topics`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.topics)) {
            setAvailableTopics(['ALL', ...data.topics]);
          }
        }
      } catch (err) {
        console.error('Failed to load company topics:', err);
      }
    }
    loadTopics();
  }, [company]);

  // Sync state changes into URL query string shallowly
  const updateUrl = useCallback((
    diffs: string[],
    tf: string,
    sq: string,
    top: string,
    sort: string,
    p: number,
    lim: number
  ) => {
    const params = new URLSearchParams();
    if (diffs.length > 0) params.set('difficulty', diffs.join(','));
    if (tf && tf !== 'all_time') params.set('timeframe', tf);
    if (sq.trim()) params.set('search', sq.trim());
    if (top && top !== 'ALL') params.set('topic', top);
    if (sort && sort !== 'frequency') params.set('sort', sort);
    if (p > 1) params.set('page', p.toString());
    if (lim !== 50) params.set('limit', lim.toString());

    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router]);

  // Fetch problems from API with server-side filters & sort
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulties.length > 0) {
        params.set('difficulty', selectedDifficulties.join(','));
      }
      if (selectedTimeframe && selectedTimeframe !== 'all_time') {
        params.set('timeframe', selectedTimeframe);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (selectedTopic && selectedTopic !== 'ALL') {
        params.set('topic', selectedTopic);
      }
      if (sortBy) {
        params.set('sort', sortBy);
      }
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/companies/${encodeURIComponent(company)}/problems?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load problems (Status ${res.status})`);
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
      if (sortBy === 'title-asc') return <span className="text-[#33ff66] font-bold">[▲]</span>;
      if (sortBy === 'title-desc') return <span className="text-[#33ff66] font-bold">[▼]</span>;
    } else if (column === 'difficulty') {
      if (sortBy === 'difficulty-asc') return <span className="text-[#33ff66] font-bold">[▲]</span>;
      if (sortBy === 'difficulty-desc') return <span className="text-[#33ff66] font-bold">[▼]</span>;
    } else if (column === 'acceptance') {
      if (sortBy === 'acceptance-desc') return <span className="text-[#33ff66] font-bold">[▼]</span>;
      if (sortBy === 'acceptance-asc') return <span className="text-[#33ff66] font-bold">[▲]</span>;
    } else if (column === 'frequency') {
      if (sortBy === 'frequency' || sortBy === 'frequency-desc') return <span className="text-[#33ff66] font-bold">[▼]</span>;
      if (sortBy === 'frequency-asc') return <span className="text-[#33ff66] font-bold">[▲]</span>;
    }
    return <span className="text-[#62ad6a] opacity-40 group-hover:opacity-100">[↕]</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-5 font-mono text-xs text-[#33ff66] w-full">
      {/* Navigation Breadcrumb & Terminal Title Frame */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#62ad6a] border-b border-[#1a2e1a] pb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-[#33ff66] transition-colors font-bold">
              [LEETCAMP]
            </Link>
            <span>/</span>
            <span>ORGANIZATIONS</span>
            <span>/</span>
            <span className="text-[#33ff66] font-bold">{company.toUpperCase()}.SYS</span>
          </div>
          <Link
            href="/"
            className="px-2 py-0.5 border border-[#1a2e1a] hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-colors shrink-0 font-bold"
          >
            [← CD ..]
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#162e19] border border-[#2d4f2d] text-[#33ff66] flex items-center justify-center font-arcade text-sm font-bold shrink-0">
              ▓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-arcade text-sm sm:text-base md:text-lg text-[#33ff66] tracking-tight">
                  {company.toUpperCase()}.SYS
                </h1>
                <span className="px-1.5 py-0.5 text-xs bg-[#162e19] text-[#33ff66] border border-[#2d4f2d] font-bold">
                  {totalCount} RECORDS
                </span>
              </div>
              <p className="text-xs text-[#62ad6a] mt-0.5">
                INTERVIEW QUESTION DATABASE // FREQUENCY RANKINGS
              </p>
            </div>
          </div>

          <div className="text-xs text-[#62ad6a] font-mono font-bold">
            SYS_MODE: [INSPECT]
          </div>
        </div>
      </div>

      {/* Filter Control Terminal */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] p-3 sm:p-4 space-y-3">
        {/* Timeframe CLI Switches */}
        <div className="space-y-1.5">
          <span className="text-xs text-[#62ad6a] uppercase font-bold tracking-wider">
            [ TIMEFRAME_WINDOW ]
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TIMEFRAME_TABS.map((tab) => {
              const active = selectedTimeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTimeframeChange(tab.id)}
                  className={`px-2.5 py-1 text-xs border transition-colors ${
                    active
                      ? 'bg-[#33ff66] text-[#0b0f0a] border-[#33ff66] font-bold'
                      : 'bg-[#0f170e] text-[#62ad6a] border-[#1a2e1a] hover:text-[#33ff66] hover:border-[#2d4f2d]'
                  }`}
                >
                  [{tab.label}]
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Console */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-3 border-t border-[#1a2e1a]">
          {/* Difficulty Switches */}
          <div className="lg:col-span-4 space-y-1">
            <span className="text-xs text-[#62ad6a] uppercase font-bold">
              [ DIFFICULTY_FLAGS ]
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleDifficulty('Easy')}
                className={`flex-1 py-1 px-2 border text-xs transition-colors ${
                  selectedDifficulties.includes('Easy')
                    ? 'bg-[#33ff66] text-[#0b0f0a] border-[#33ff66] font-bold'
                    : 'bg-[#0f170e] text-[#33ff66] border-[#1a2e1a] hover:border-[#33ff66]'
                }`}
              >
                [--EASY]
              </button>
              <button
                onClick={() => toggleDifficulty('Medium')}
                className={`flex-1 py-1 px-2 border text-xs transition-colors ${
                  selectedDifficulties.includes('Medium')
                    ? 'bg-[#ffb000] text-[#0b0f0a] border-[#ffb000] font-bold'
                    : 'bg-[#0f170e] text-[#ffb000] border-[#1a2e1a] hover:border-[#ffb000]'
                }`}
              >
                [--MED]
              </button>
              <button
                onClick={() => toggleDifficulty('Hard')}
                className={`flex-1 py-1 px-2 border text-xs transition-colors ${
                  selectedDifficulties.includes('Hard')
                    ? 'bg-[#ff3b3b] text-[#0b0f0a] border-[#ff3b3b] font-bold'
                    : 'bg-[#0f170e] text-[#ff3b3b] border-[#1a2e1a] hover:border-[#ff3b3b]'
                }`}
              >
                [--HARD]
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-3 space-y-1">
            <span className="text-xs text-[#62ad6a] uppercase font-bold">
              [ GREP_TITLE ]
            </span>
            <div className="flex items-center bg-[#0f170e] border border-[#1a2e1a] focus-within:border-[#33ff66] px-2.5 py-1">
              <span className="text-[#33ff66] font-bold mr-1.5">&gt;</span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="grep title..."
                className="w-full bg-transparent text-[#33ff66] placeholder-[#62ad6a] text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Topic Select */}
          <div className="lg:col-span-3 space-y-1">
            <span className="text-xs text-[#62ad6a] uppercase font-bold">
              [ TOPIC_TAG ]
            </span>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full bg-[#0f170e] border border-[#1a2e1a] focus:border-[#33ff66] text-[#33ff66] text-xs px-2 py-1 cursor-pointer font-mono outline-none"
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
            <span className="text-xs text-[#62ad6a] uppercase font-bold">
              [ ORDER_BY ]
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value);
              }}
              className="w-full bg-[#0f170e] border border-[#1a2e1a] focus:border-[#33ff66] text-[#33ff66] text-xs px-2 py-1 cursor-pointer font-mono outline-none"
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
          <div className="flex items-center justify-between pt-2 border-t border-[#1a2e1a] text-xs text-[#62ad6a]">
            <div>
              FLAGS_ACTIVE: {selectedTimeframe !== 'all_time' && `[${selectedTimeframe}] `} {selectedDifficulties.length > 0 && `[${selectedDifficulties.join('+')}] `} {searchQuery && `grep("${searchQuery}") `} {selectedTopic !== 'ALL' && `tag("${selectedTopic}") `}
            </div>
            <button
              onClick={resetFilters}
              className="text-[#33ff66] hover:underline font-bold"
            >
              [CLEAR_FLAGS]
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 border border-[#ff3b3b] bg-[#1a0e0e] text-[#ff3b3b] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div>SYS_ERR: {error}</div>
        </div>
      )}

      {/* Problems High-Score Table */}
      <div className="border border-[#1a2e1a] bg-[#0b0f0a] overflow-hidden w-full">
        {loading ? (
          /* Terminal Skeleton Loader */
          <div className="p-6 space-y-2 text-[#62ad6a]">
            <div className="font-arcade text-xs text-[#33ff66]">
              [LOADING QUERY RESULT SET FROM SQLITE...]
            </div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-1.5 border-b border-[#1a2e1a]">
                <span className="w-8 text-[#62ad6a]">#{i + 1}</span>
                <span className="w-64 bg-[#162e19] h-3"></span>
                <span className="w-16 bg-[#162e19] h-3"></span>
                <span className="w-20 bg-[#162e19] h-3"></span>
                <span className="w-32 bg-[#162e19] h-3"></span>
              </div>
            ))}
          </div>
        ) : problems.length > 0 ? (
          <>
            {/* Desktop Full-width Terminal Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#1a2e1a] bg-[#0f170e] text-[#62ad6a] font-mono uppercase text-xs select-none">
                    <th className="py-2.5 px-3 w-12 text-center">#PID</th>
                    <th 
                      onClick={() => handleSortHeader('title')}
                      className="py-2.5 px-3 cursor-pointer hover:text-[#33ff66] transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>PROBLEM_TITLE</span>
                        {renderSortIndicator('title')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortHeader('difficulty')}
                      className="py-2.5 px-3 w-28 cursor-pointer hover:text-[#33ff66] transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>DIFFICULTY</span>
                        {renderSortIndicator('difficulty')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortHeader('acceptance')}
                      className="py-2.5 px-3 w-24 text-right cursor-pointer hover:text-[#33ff66] transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>ACCEPT%</span>
                        {renderSortIndicator('acceptance')}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSortHeader('frequency')}
                      className="py-2.5 px-3 w-36 cursor-pointer hover:text-[#33ff66] transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>FREQ_SCORE</span>
                        {renderSortIndicator('frequency')}
                      </div>
                    </th>
                    <th className="py-2.5 px-3">TOPICS</th>
                    <th className="py-2.5 px-3 w-24 text-center">EXECUTE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2e1a]">
                  {problems.map((prob, idx) => {
                    const rowNumber = (page - 1) * limit + idx + 1;
                    const isEasy = prob.difficulty === 'Easy';
                    const isMed = prob.difficulty === 'Medium';

                    return (
                      <tr
                        key={`${prob.id}-${prob.slug}`}
                        className="hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-colors group"
                      >
                        <td className="py-2.5 px-3 text-center text-[#62ad6a] group-hover:text-[#0b0f0a] font-mono text-xs">
                          {rowNumber.toString().padStart(3, '0')}
                        </td>
                        <td className="py-2.5 px-3">
                          <a
                            href={prob.leetcode_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#33ff66] group-hover:text-[#0b0f0a] inline-flex items-center gap-1.5 text-sm"
                          >
                            <span>{prob.title}</span>
                          </a>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-bold border ${
                              isEasy
                                ? 'text-[#33ff66] border-[#33ff66] group-hover:bg-[#0b0f0a] group-hover:text-[#33ff66]'
                                : isMed
                                ? 'text-[#ffb000] border-[#ffb000] group-hover:bg-[#0b0f0a] group-hover:text-[#ffb000]'
                                : 'text-[#ff3b3b] border-[#ff3b3b] group-hover:bg-[#0b0f0a] group-hover:text-[#ff3b3b]'
                            }`}
                          >
                            {prob.difficulty.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono group-hover:text-[#0b0f0a] text-xs sm:text-sm font-bold">
                          {formatAcceptance(prob.acceptance)}
                        </td>
                        <td className="py-2.5 px-3">
                          {prob.frequency !== null ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-mono font-bold">
                                {prob.frequency.toFixed(1)}%
                              </span>
                              <span className="text-xs text-[#62ad6a] group-hover:text-[#0b0f0a]">
                                {'█'.repeat(Math.round(prob.frequency / 20))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#62ad6a] group-hover:text-[#0b0f0a]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {prob.topics ? (
                            <div className="flex flex-wrap gap-1">
                              {prob.topics.split(',').slice(0, 4).map((topic, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 text-xs border border-[#1a2e1a] text-[#62ad6a] group-hover:border-[#0b0f0a] group-hover:text-[#0b0f0a]"
                                >
                                  {topic.trim()}
                                </span>
                              ))}
                              {prob.topics.split(',').length > 4 && (
                                <span className="text-xs text-[#62ad6a] group-hover:text-[#0b0f0a]">
                                  +{prob.topics.split(',').length - 4}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#62ad6a] group-hover:text-[#0b0f0a]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <a
                            href={prob.leetcode_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#33ff66] bg-[#162e19] text-[#33ff66] group-hover:bg-[#0b0f0a] group-hover:text-[#33ff66] group-hover:border-[#0b0f0a] transition-all"
                          >
                            <span>[RUN ↗]</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile CLI View */}
            <div className="md:hidden divide-y divide-[#1a2e1a]">
              {problems.map((prob, idx) => {
                const rowNumber = (page - 1) * limit + idx + 1;
                const isEasy = prob.difficulty === 'Easy';
                const isMed = prob.difficulty === 'Medium';

                return (
                  <div key={`${prob.id}-${prob.slug}`} className="p-3 space-y-2 hover:bg-[#0f170e]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-[#62ad6a] mr-2">#{rowNumber}</span>
                        <a
                          href={prob.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-[#33ff66] hover:underline"
                        >
                          {prob.title}
                        </a>
                      </div>
                      <a
                        href={prob.leetcode_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs font-bold border border-[#33ff66] bg-[#162e19] text-[#33ff66]"
                      >
                        [RUN]
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-1.5 py-0.5 text-xs font-bold border ${
                          isEasy ? 'text-[#33ff66] border-[#33ff66]' : isMed ? 'text-[#ffb000] border-[#ffb000]' : 'text-[#ff3b3b] border-[#ff3b3b]'
                        }`}
                      >
                        {prob.difficulty.toUpperCase()}
                      </span>
                      <span className="text-[#62ad6a]">
                        ACCEPT: <span className="text-[#33ff66] font-bold">{formatAcceptance(prob.acceptance)}</span>
                      </span>
                      {prob.frequency !== null && (
                        <span className="text-[#62ad6a]">
                          FREQ: <span className="text-[#33ff66] font-bold">{prob.frequency.toFixed(1)}%</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Terminal Bar */}
            <div className="p-3 bg-[#0f170e] border-t border-[#1a2e1a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#62ad6a]">
              <div>
                PAGE_STATUS: ROWS{' '}
                <span className="text-[#33ff66] font-bold">
                  {(page - 1) * limit + 1}..{Math.min(page * limit, totalCount)}
                </span>{' '}
                OF <span className="text-[#33ff66] font-bold">{totalCount}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span>LIMIT:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-[#0b0f0a] border border-[#1a2e1a] text-[#33ff66] text-xs px-1.5 py-0.5 outline-none font-bold"
                  >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2.5 py-1 border border-[#1a2e1a] text-[#33ff66] disabled:opacity-30 hover:bg-[#33ff66] hover:text-[#0b0f0a] font-bold"
                  >
                    [PREV]
                  </button>
                  <span className="px-2 font-mono text-xs text-[#33ff66] font-bold">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-2.5 py-1 border border-[#1a2e1a] text-[#33ff66] disabled:opacity-30 hover:bg-[#33ff66] hover:text-[#0b0f0a] font-bold"
                  >
                    [NEXT]
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty Terminal Output */
          <div className="text-center py-12 px-4 space-y-2">
            <div className="font-arcade text-xs text-[#ff3b3b]">
              [!] NO QUERY RESULTS
            </div>
            <p className="text-xs text-[#62ad6a]">
              NO PROBLEMS MATCHED ACTIVE FLAGS FOR {company.toUpperCase()}.SYS.
            </p>
            <button
              onClick={resetFilters}
              className="px-3 py-1 bg-[#162e19] border border-[#2d4f2d] text-[#33ff66] text-xs hover:bg-[#33ff66] hover:text-[#0b0f0a] font-bold"
            >
              [RESET_FLAGS]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
