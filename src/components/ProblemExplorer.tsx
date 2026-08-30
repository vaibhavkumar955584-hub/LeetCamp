'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Search,
  ArrowLeft,
  Layers,
  Flame,
  Clock,
  Target,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
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
  { id: 'all_time', label: 'All Time' },
  { id: '30_days', label: '30 Days' },
  { id: '90_days', label: '90 Days' },
  { id: '6_months', label: '6 Months' },
  { id: 'more_than_six_months', label: '> 6 Months' },
];

export function ProblemExplorer({ company, initialData }: ProblemExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial states from URL params
  const initialTimeframe = searchParams.get('timeframe') || 'all_time';
  const initialDifficulty = searchParams.get('difficulty') 
    ? searchParams.get('difficulty')!.split(',').map((d) => d.trim()).filter(Boolean) 
    : [];
  const initialSearch = searchParams.get('search') || '';
  const initialTopic = searchParams.get('topic') || 'ALL';
  const initialTrack = searchParams.get('track') || 'ALL';
  const initialSort = searchParams.get('sort') || 'frequency';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialLimit = parseInt(searchParams.get('limit') || '50', 10) || 50;

  const [problems, setProblems] = useState<Problem[]>(initialData?.problems || []);
  const [overview, setOverview] = useState<any>(initialData?.overview || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(initialDifficulty);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(initialTimeframe);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [selectedTrack, setSelectedTrack] = useState<string>(initialTrack);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Active Insights Tab: 'frequent' | 'recent' | 'tracks' | 'patterns'
  const [insightsTab, setInsightsTab] = useState<'frequent' | 'recent' | 'tracks'>('frequent');

  // Pagination States
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalCount, setTotalCount] = useState(initialData?.pagination?.total || 0);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.totalPages || 1);

  const [availableTopics, setAvailableTopics] = useState<string[]>(['ALL']);
  const [companyPatterns, setCompanyPatterns] = useState<any[]>([]);

  // Fetch company topics, patterns and overview on mount
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

  // Synchronize state with URL search params
  const updateUrl = useCallback(
    (
      diffs: string[],
      tf: string,
      search: string,
      topic: string,
      track: string,
      sort: string,
      currPage: number,
      currLimit: number
    ) => {
      const params = new URLSearchParams();
      if (diffs.length > 0) params.set('difficulty', diffs.join(','));
      if (tf !== 'all_time') params.set('timeframe', tf);
      if (search.trim()) params.set('search', search.trim());
      if (topic !== 'ALL') params.set('topic', topic);
      if (track !== 'ALL') params.set('track', track);
      if (sort !== 'frequency') params.set('sort', sort);
      if (currPage > 1) params.set('page', currPage.toString());
      if (currLimit !== 50) params.set('limit', currLimit.toString());

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch problems with memoized parameters
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulties.length > 0) params.set('difficulty', selectedDifficulties.join(','));
      if (selectedTimeframe) params.set('timeframe', selectedTimeframe);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedTopic && selectedTopic !== 'ALL') params.set('topic', selectedTopic);
      if (selectedTrack && selectedTrack !== 'ALL') params.set('track', selectedTrack);
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
      if (data.overview) setOverview(data.overview);
      setTotalCount(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching problems:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [company, selectedDifficulties, selectedTimeframe, searchQuery, selectedTopic, selectedTrack, sortBy, page, limit]);

  // Refetch whenever filters change
  useEffect(() => {
    fetchProblems();
    updateUrl(selectedDifficulties, selectedTimeframe, searchQuery, selectedTopic, selectedTrack, sortBy, page, limit);
  }, [fetchProblems, updateUrl, selectedDifficulties, selectedTimeframe, searchQuery, selectedTopic, selectedTrack, sortBy, page, limit]);

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

  const handleTrackChange = (newTrack: string) => {
    setPage(1);
    setSelectedTrack(newTrack);
  };

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
    setSelectedTrack('ALL');
    setSortBy('frequency');
    setPage(1);
  };

  const hasActiveFilters =
    selectedDifficulties.length > 0 ||
    selectedTimeframe !== 'all_time' ||
    searchQuery.trim() !== '' ||
    selectedTopic !== 'ALL' ||
    selectedTrack !== 'ALL' ||
    sortBy !== 'frequency';

  const formatAcceptance = (rate: number | null) => {
    if (rate === null || rate === undefined || isNaN(rate)) return '—';
    const pct = rate <= 0.1 ? rate * 10000 : rate <= 1 ? rate * 100 : rate;
    return `${pct.toFixed(1)}%`;
  };

  const renderSortIndicator = (column: string) => {
    if (column === 'title') {
      if (sortBy === 'title-asc') return <span className="text-[var(--accent-green)] font-bold">▲</span>;
      if (sortBy === 'title-desc') return <span className="text-[var(--accent-green)] font-bold">▼</span>;
    } else if (column === 'difficulty') {
      if (sortBy === 'difficulty-asc') return <span className="text-[var(--accent-green)] font-bold">▲</span>;
      if (sortBy === 'difficulty-desc') return <span className="text-[var(--accent-green)] font-bold">▼</span>;
    } else if (column === 'acceptance') {
      if (sortBy === 'acceptance-desc') return <span className="text-[var(--accent-green)] font-bold">▼</span>;
      if (sortBy === 'acceptance-asc') return <span className="text-[var(--accent-green)] font-bold">▲</span>;
    } else if (column === 'frequency') {
      if (sortBy === 'frequency' || sortBy === 'frequency-desc') return <span className="text-[var(--accent-green)] font-bold">▼</span>;
      if (sortBy === 'frequency-asc') return <span className="text-[var(--accent-green)] font-bold">▲</span>;
    }
    return <span className="text-[var(--text-muted)] opacity-50 group-hover:opacity-100">↕</span>;
  };

  const mostFrequentList = overview?.mostFrequent || [];
  const recentList = overview?.recentQuestions || [];
  const hiringTracksList = overview?.hiringTracks || [];
  const recommendedPatternsList = overview?.recommendedPatterns || [];

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header & Breadcrumb Surface */}
      <div className="data-surface p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors font-medium">
              Organizations
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-semibold">{company}</span>
          </div>
          <Link
            href="/"
            className="btn-primary py-1 px-2.5 text-xs"
          >
            <ArrowLeft size={13} />
            <span>All Companies</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {company}
              </h1>
              <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] mono font-semibold">
                {totalCount} Questions
              </span>
              {hiringTracksList.length > 0 && (
                <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-medium">
                  {hiringTracksList.length} Hiring Tracks (Ninja, Prime, SP, DSE)
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Interview question bank, recency analysis, and frequency ranking for {company}
            </p>
          </div>
        </div>

        {/* Pattern Cross-reference Banner */}
        {companyPatterns.length > 0 && (
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-raised)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 flex-wrap">
              <Layers size={16} className="text-[var(--accent-green)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {companyPatterns.length} DSA pattern questions tagged for {company}
              </span>
            </div>
            <Link
              href="/patterns"
              className="btn-primary py-1 px-3 text-xs"
            >
              <span>Explore Patterns</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* SMART PREPARATION INSIGHTS & RECOMMENDATIONS ENGINE */}
      {(mostFrequentList.length > 0 || recentList.length > 0 || hiringTracksList.length > 0) && (
        <div className="data-surface p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--accent-green)]" />
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Smart Preparation Insights & Recommendations
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Curated intelligence: top reported questions, recent round appearances, and hiring tracks
                </p>
              </div>
            </div>

            {/* Tab Switches */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-surface-raised)] p-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
              <button
                onClick={() => setInsightsTab('frequent')}
                className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 ${
                  insightsTab === 'frequent'
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Flame size={13} />
                <span>Most Frequent</span>
              </button>
              <button
                onClick={() => setInsightsTab('recent')}
                className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 ${
                  insightsTab === 'recent'
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Clock size={13} />
                <span>Recent Rounds</span>
              </button>
              {hiringTracksList.length > 0 && (
                <button
                  onClick={() => setInsightsTab('tracks')}
                  className={`px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 ${
                    insightsTab === 'tracks'
                      ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Target size={13} />
                  <span>Hiring Tracks ({hiringTracksList.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Most Frequent Questions Carousel/Grid */}
          {insightsTab === 'frequent' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>🔥 High-Frequency Must-Solve Questions (Highest probability of appearing in upcoming rounds)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {mostFrequentList.map((q: any) => (
                  <a
                    key={q.slug}
                    href={q.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="data-surface p-3.5 hover:border-[var(--accent-green)] transition-all flex flex-col justify-between gap-2.5 group bg-[var(--bg-surface-raised)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`chip ${q.difficulty === 'Easy' ? 'chip-easy' : q.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                          {q.difficulty}
                        </span>
                        {q.frequency && (
                          <span className="text-[11px] mono text-[var(--accent-green)] font-semibold">
                            {q.frequency.toFixed(0)}% freq
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-white line-clamp-2">
                        {q.title}
                      </h3>
                    </div>
                    {q.hiring_track && (
                      <span className="text-[10px] text-[var(--text-muted)] mono truncate">
                        🎯 {q.hiring_track}
                      </span>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-1.5">
                      <span>{q.platform || 'LeetCode'}</span>
                      <ExternalLink size={12} className="group-hover:text-[var(--accent-green)]" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Recent Recruitment Round Questions */}
          {insightsTab === 'recent' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>⚡ Questions reported in recent 30-day, 90-day & 2025/2026 On-Campus cycles</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {recentList.map((q: any) => (
                  <a
                    key={q.slug}
                    href={q.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="data-surface p-3.5 hover:border-[var(--accent-green)] transition-all flex flex-col justify-between gap-2.5 group bg-[var(--bg-surface-raised)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`chip ${q.difficulty === 'Easy' ? 'chip-easy' : q.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                          {q.difficulty}
                        </span>
                        <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] text-[10px]">
                          Recent
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-white line-clamp-2">
                        {q.title}
                      </h3>
                    </div>
                    {q.hiring_track && (
                      <span className="text-[10px] text-[var(--text-muted)] mono truncate">
                        🎯 {q.hiring_track}
                      </span>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-1.5">
                      <span>{q.platform || 'LeetCode'}</span>
                      <ExternalLink size={12} className="group-hover:text-[var(--accent-green)]" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Hiring Tracks Breakdown */}
          {insightsTab === 'tracks' && hiringTracksList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>🎯 Select a hiring track to focus directly on relevant interview questions:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {hiringTracksList.map((t: any) => {
                  const isSelected = selectedTrack === t.track;
                  return (
                    <button
                      key={t.track}
                      onClick={() => handleTrackChange(isSelected ? 'ALL' : t.track)}
                      className={`data-surface p-4 text-left transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-[var(--accent-green)] bg-[var(--bg-hover)]'
                          : 'hover:border-[var(--border-strong)] bg-[var(--bg-surface-raised)]'
                      }`}
                    >
                      <div>
                        <span className="label-caps block mb-1">Track</span>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          {t.track}
                        </h3>
                        <span className="text-xs text-[var(--text-muted)] mono mt-1 block">
                          {t.count} Curated Questions
                        </span>
                      </div>
                      <span className={`chip ${isSelected ? 'bg-[var(--accent-green)] text-[#0e0f12]' : 'bg-[var(--bg-hover)] text-[var(--text-primary)]'}`}>
                        {isSelected ? 'Active' : 'Filter'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Control Console Toolbar */}
      <div className="data-surface p-4 sm:p-5 space-y-4">
        {/* Timeframe Tabs */}
        <div className="space-y-2">
          <span className="label-caps block">Timeframe Window</span>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAME_TABS.map((tab) => {
              const active = selectedTimeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTimeframeChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
                    active
                      ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                      : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Console */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-3 border-t border-[var(--border-subtle)]">
          {/* Difficulty Chips Selection */}
          <div className="lg:col-span-3 space-y-1.5">
            <span className="label-caps block">Difficulty Filter</span>
            <div className="flex items-center gap-2">
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

          {/* Hiring Track Filter */}
          {hiringTracksList.length > 0 && (
            <div className="lg:col-span-3 space-y-1.5">
              <span className="label-caps block">Hiring Track</span>
              <select
                value={selectedTrack}
                onChange={(e) => handleTrackChange(e.target.value)}
                className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] text-xs px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer outline-none"
              >
                <option value="ALL">All Hiring Tracks</option>
                {hiringTracksList.map((t: any) => (
                  <option key={t.track} value={t.track}>
                    {t.track} ({t.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className={hiringTracksList.length > 0 ? "lg:col-span-3 space-y-1.5" : "lg:col-span-4 space-y-1.5"}>
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

          {/* Topic Select */}
          <div className={hiringTracksList.length > 0 ? "lg:col-span-3 space-y-1.5" : "lg:col-span-3 space-y-1.5"}>
            <span className="label-caps block">Topic Category</span>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] text-xs px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer outline-none"
            >
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === 'ALL' ? 'All Topics' : topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Active filters:</span>
              {selectedTimeframe !== 'all_time' && <span className="chip bg-[var(--bg-hover)] text-[var(--text-primary)]">{selectedTimeframe}</span>}
              {selectedDifficulties.map((d) => (
                <span key={d} className="chip bg-[var(--bg-hover)] text-[var(--text-primary)]">{d}</span>
              ))}
              {selectedTrack !== 'ALL' && <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)]">Track: {selectedTrack}</span>}
              {searchQuery && <span className="chip bg-[var(--bg-hover)] text-[var(--text-primary)]">&quot;{searchQuery}&quot;</span>}
              {selectedTopic !== 'ALL' && <span className="chip bg-[var(--bg-hover)] text-[var(--text-primary)]">{selectedTopic}</span>}
            </div>
            <button
              onClick={resetFilters}
              className="text-[var(--diff-hard)] hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mono px-1">
        <span>
          Showing <strong className="text-[var(--text-primary)]">{problems.length}</strong> of {totalCount} matching questions
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
            <p>Loading questions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[var(--diff-hard)] space-y-3">
            <AlertCircle className="w-6 h-6 mx-auto" />
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
            <p className="text-[var(--text-secondary)] text-sm">No problems found matching current filters</p>
            <button
              onClick={resetFilters}
              className="btn-primary"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-muted)] label-caps select-none">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th 
                  onClick={() => handleSortHeader('title')}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Title</span>
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSortHeader('difficulty')}
                  className="py-3 px-4 w-28 cursor-pointer hover:text-[var(--text-primary)] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Difficulty</span>
                    {renderSortIndicator('difficulty')}
                  </div>
                </th>
                <th className="py-3 px-4 hidden md:table-cell">Track / Source</th>
                <th 
                  onClick={() => handleSortHeader('acceptance')}
                  className="py-3 px-4 w-24 text-right cursor-pointer hover:text-[var(--text-primary)] transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Acceptance</span>
                    {renderSortIndicator('acceptance')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSortHeader('frequency')}
                  className="py-3 px-4 w-32 cursor-pointer hover:text-[var(--text-primary)] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Frequency</span>
                    {renderSortIndicator('frequency')}
                  </div>
                </th>
                <th className="py-3 px-4">Topics</th>
                <th className="py-3 px-4 w-24 text-center">Solve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {problems.map((prob, idx) => {
                const rowNumber = (page - 1) * limit + idx + 1;
                const isEasy = prob.difficulty === 'Easy';
                const isMed = prob.difficulty === 'Medium';

                return (
                  <tr
                    key={`${prob.id}-${prob.slug}`}
                    className="hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center text-[var(--text-muted)] mono">
                      {rowNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={prob.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent-green)] transition-colors inline-flex items-center gap-1.5 text-sm"
                        >
                          <span>{prob.title}</span>
                        </a>
                        {prob.timeframe === '30_days' && (
                          <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] text-[10px]">
                            ⚡ Recent
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isEasy && <span className="chip chip-easy">Easy</span>}
                      {isMed && <span className="chip chip-medium">Medium</span>}
                      {!isEasy && !isMed && <span className="chip chip-hard">Hard</span>}
                    </td>
                    {/* Track / Platform */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        {prob.hiring_track && (
                          <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--accent-green)] text-[10px] w-fit">
                            {prob.hiring_track}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--text-muted)] mono">
                          {prob.platform || 'LeetCode'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right mono font-medium text-[var(--text-secondary)]">
                      {formatAcceptance(prob.acceptance)}
                    </td>
                    <td className="py-3.5 px-4">
                      {prob.frequency !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="mono font-semibold text-[var(--text-primary)]">
                            {prob.frequency.toFixed(1)}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-[var(--bg-surface-raised)] hidden sm:block">
                            <div
                              style={{ width: `${Math.min(100, prob.frequency)}%` }}
                              className="bg-[var(--accent-green)] h-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {prob.topics ? (
                        <div className="flex flex-wrap gap-1">
                          {prob.topics.split(',').slice(0, 3).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[11px] rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                            >
                              {topic.trim()}
                            </span>
                          ))}
                          {prob.topics.split(',').length > 3 && (
                            <span className="text-[11px] text-[var(--text-muted)] px-1 py-0.5">
                              +{prob.topics.split(',').length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={prob.leetcode_url}
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
