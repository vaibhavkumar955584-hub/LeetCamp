'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Building2,
  ExternalLink,
  Layers,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Terminal,
  HelpCircle,
  Play,
  Bookmark,
  BookmarkCheck,
  LayoutGrid,
  Table as TableIcon,
  BarChart2,
  Filter,
  History,
  Trash2,
  Zap,
  Award,
  Star
} from 'lucide-react';
import { QuestionLookupDetail, QuestionSearchResult } from '@/lib/db';
import { ProblemSolveModal } from './ProblemSolveModal';
import { getProblemAttempts } from '@/lib/userProgress';

const POPULAR_QUESTIONS = [
  { name: 'Minimum Moves to Clean the Classroom', slug: 'minimum-moves-to-clean-the-classroom', difficulty: 'Medium' },
  { name: 'Two Sum', slug: 'two-sum', difficulty: 'Easy' },
  { name: 'LRU Cache', slug: 'lru-cache', difficulty: 'Medium' },
  { name: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard' },
  { name: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' },
  { name: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium' },
  { name: 'Word Break', slug: 'word-break', difficulty: 'Medium' },
  { name: 'Alien Dictionary', slug: 'alien-dictionary', difficulty: 'Hard' },
  { name: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard' },
];

const BIG_TECH_NAMES = ['google', 'meta', 'apple', 'amazon', 'microsoft', 'netflix'];
const FINTECH_NAMES = ['bloomberg', 'goldman sachs', 'morgan stanley', 'citadel', 'jpmorgan', 'jp morgan', 'two sigma', 'de shaw', 'blackrock'];
const UNICORN_NAMES = ['uber', 'bytedance', 'airbnb', 'stripe', 'snowflake', 'doordash', 'coinbase', 'databricks', 'pinterest', 'snap'];
const SERVICE_NAMES = ['tcs', 'infosys', 'wipro', 'cognizant', 'accenture', 'capgemini', 'hcl', 'tech mahindra', 'lti', 'mindtree'];

const RECENT_SEARCHES_KEY = 'leetcamp_recent_lookups';
const BOOKMARKS_KEY = 'leetcamp_lookup_bookmarks';

export function QuestionLookup({ initialSlug }: { initialSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, QuestionSearchResult[]>>(new Map());

  const initialQuery = searchParams.get('q') || initialSlug || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialQuery);
  
  // Search Autocomplete state
  const [suggestions, setSuggestions] = useState<QuestionSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<{ name: string; slug: string; difficulty: string }[]>([]);

  // Bookmarks
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);

  // Selected Question Details state
  const [details, setDetails] = useState<QuestionLookupDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [companySearch, setCompanySearch] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState<'ALL' | '30_days' | '90_days' | '6_months' | 'more_than_six_months'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'big_tech' | 'fintech' | 'unicorns' | 'services'>('ALL');
  const [sortBy, setSortBy] = useState<'frequency' | 'alpha' | 'recency'>('frequency');

  // Pagination for companies
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Solve Modal State
  const [solveModalProblem, setSolveModalProblem] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // User attempts state
  const [userAttempts, setUserAttempts] = useState<Record<string, any>>({});

  // Load user progress and bookmarks on client mount
  useEffect(() => {
    try {
      setUserAttempts(getProblemAttempts());
      const savedRecents = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (savedRecents) {
        setRecentSearches(JSON.parse(savedRecents));
      }
      const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (savedBookmarks) {
        setBookmarkedSlugs(JSON.parse(savedBookmarks));
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Global hotkey '/' to focus search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const saveRecentSearch = (item: { name: string; slug: string; difficulty: string }) => {
    try {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.slug !== item.slug);
        const updated = [item, ...filtered].slice(0, 6);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch {
      // ignore
    }
  };

  const toggleBookmark = (slug: string) => {
    setBookmarkedSlugs((prev) => {
      let updated: string[];
      if (prev.includes(slug)) {
        updated = prev.filter((s) => s !== slug);
      } else {
        updated = [...prev, slug];
      }
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // 1. Fetch details when a specific problem slug is selected
  const fetchQuestionDetails = useCallback(async (slugOrTitle: string) => {
    if (!slugOrTitle || !slugOrTitle.trim()) {
      setDetails(null);
      return;
    }

    setIsLoadingDetails(true);
    setError(null);
    setPage(1);
    setCompanySearch('');
    setTimeframeFilter('ALL');
    setCategoryFilter('ALL');

    try {
      const res = await fetch(`/api/questions/search?slug=${encodeURIComponent(slugOrTitle.trim())}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(`No company question records found for "${slugOrTitle}". Try searching another question.`);
          setDetails(null);
        } else {
          setError('Failed to fetch question company details. Please try again.');
        }
        return;
      }

      const data: QuestionLookupDetail = await res.json();
      setDetails(data);
      setSelectedSlug(data.slug);
      setQuery(data.title);
      setShowDropdown(false);

      saveRecentSearch({ name: data.title, slug: data.slug, difficulty: data.difficulty });

      // Update URL without full refresh
      const params = new URLSearchParams(window.location.search);
      params.set('q', data.slug);
      window.history.replaceState(null, '', `?${params.toString()}`);
    } catch (err: any) {
      console.error('Error fetching question details:', err);
      setError(err.message || 'An error occurred while loading question data.');
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // Initial load if query or slug present
  useEffect(() => {
    if (initialQuery) {
      fetchQuestionDetails(initialQuery);
    }
  }, [initialQuery, fetchQuestionDetails]);

  // 2. Key-by-key real-time autocomplete search with debounce & memory cache
  useEffect(() => {
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Check memory cache first
    const cacheKey = cleanQ.toLowerCase();
    if (cacheRef.current.has(cacheKey)) {
      setSuggestions(cacheRef.current.get(cacheKey)!);
      setShowDropdown(true);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/questions/search?q=${encodeURIComponent(cleanQ)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          const results: QuestionSearchResult[] = data.results || [];
          cacheRef.current.set(cacheKey, results);
          setSuggestions(results);
          setShowDropdown(true);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error('Key-by-key search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 100); // 100ms instant micro-debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation for search dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelectSuggestion(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (query.trim()) {
        fetchQuestionDetails(query.trim());
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (item: QuestionSearchResult) => {
    setQuery(item.title);
    setSelectedSlug(item.slug);
    setShowDropdown(false);
    fetchQuestionDetails(item.slug);
  };

  const handleSelectPopular = (item: { name: string; slug: string }) => {
    setQuery(item.name);
    setSelectedSlug(item.slug);
    fetchQuestionDetails(item.slug);
  };

  const handleCopyLink = () => {
    if (!details) return;
    const url = `${window.location.origin}/lookup?q=${encodeURIComponent(details.slug)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered & Sorted companies for the selected question
  const filteredCompanies = useMemo(() => {
    if (!details || !details.companies) return [];

    return details.companies
      .filter((comp) => {
        const cLower = comp.company.toLowerCase();

        // Text search filter
        if (companySearch.trim()) {
          const s = companySearch.toLowerCase().trim();
          if (!cLower.includes(s)) {
            return false;
          }
        }

        // Timeframe filter
        if (timeframeFilter !== 'ALL') {
          if (!comp.timeframes.includes(timeframeFilter)) {
            return false;
          }
        }

        // Category / Tier Filter
        if (categoryFilter === 'big_tech') {
          if (!BIG_TECH_NAMES.some((n) => cLower.includes(n))) return false;
        } else if (categoryFilter === 'fintech') {
          if (!FINTECH_NAMES.some((n) => cLower.includes(n))) return false;
        } else if (categoryFilter === 'unicorns') {
          if (!UNICORN_NAMES.some((n) => cLower.includes(n))) return false;
        } else if (categoryFilter === 'services') {
          if (!SERVICE_NAMES.some((n) => cLower.includes(n))) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'frequency') {
          return b.max_frequency - a.max_frequency || a.company.localeCompare(b.company);
        }
        if (sortBy === 'alpha') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'recency') {
          const recencyScore = (t: string[]) => {
            if (t.includes('30_days')) return 4;
            if (t.includes('90_days')) return 3;
            if (t.includes('6_months')) return 2;
            if (t.includes('more_than_six_months')) return 1;
            return 0;
          };
          return recencyScore(b.timeframes) - recencyScore(a.timeframes) || b.max_frequency - a.max_frequency;
        }
        return 0;
      });
  }, [details, companySearch, timeframeFilter, categoryFilter, sortBy]);

  // Paginated companies
  const totalPages = Math.ceil(filteredCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, page, pageSize]);

  // Top 8 companies by frequency for visual breakdown chart
  const topCompaniesChart = useMemo(() => {
    if (!details || !details.companies) return [];
    return details.companies.slice(0, 8);
  }, [details]);

  const maxChartFreq = useMemo(() => {
    if (!topCompaniesChart.length) return 100;
    return Math.max(...topCompaniesChart.map((c) => c.max_frequency || 0), 10);
  }, [topCompaniesChart]);

  // Helper for difficulty styling
  const getDifficultyBadge = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === 'easy') {
      return (
        <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--diff-easy-bg)] text-[var(--diff-easy)] border border-[var(--diff-easy)]/30 shadow-sm">
          Easy
        </span>
      );
    }
    if (d === 'medium') {
      return (
        <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--diff-medium-bg)] text-[var(--diff-medium)] border border-[var(--diff-medium)]/30 shadow-sm">
          Medium
        </span>
      );
    }
    if (d === 'hard') {
      return (
        <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--diff-hard-bg)] text-[var(--diff-hard)] border border-[var(--diff-hard)]/30 shadow-sm">
          Hard
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
        {diff}
      </span>
    );
  };

  const getTimeframeBadge = (tf: string) => {
    switch (tf) {
      case '30_days':
        return (
          <span key={tf} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Flame size={10} /> 30d
          </span>
        );
      case '90_days':
        return (
          <span key={tf} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Clock size={10} /> 90d
          </span>
        );
      case '6_months':
        return (
          <span key={tf} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            6m
          </span>
        );
      case 'more_than_six_months':
        return (
          <span key={tf} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
            &gt; 6m
          </span>
        );
      case 'all_time':
        return (
          <span key={tf} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            All-Time
          </span>
        );
      default:
        return (
          <span key={tf} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-muted)]">
            {tf}
          </span>
        );
    }
  };

  const isCurrentBookmarked = details ? bookmarkedSlugs.includes(details.slug) : false;
  const currentAttempt = details ? userAttempts[details.slug] : null;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="data-surface p-6 sm:p-8 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-semibold">
                <Search size={12} className="mr-1" />
                Question Reverse-Lookup
              </span>
              <span className="text-xs text-[var(--text-muted)] mono">
                Real-Time Key-by-Key Lookup across 429+ Companies
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Find Which Companies Ask Any DSA Problem
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Type any question title, problem slug, or paste a LeetCode URL. Instantly discover interview recency, frequency scores, hiring tracks, and company-specific patterns.
            </p>
          </div>
        </div>

        {/* Real-Time Search Bar with Autocomplete Dropdown */}
        <div className="relative w-full max-w-3xl">
          <div className="relative flex items-center bg-[var(--bg-base)] rounded-[var(--radius-md)] border-2 border-[var(--border-strong)] focus-within:border-[var(--accent-green)] transition-all shadow-lg">
            <Search size={20} className="ml-4 text-[var(--accent-green)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type question name (e.g. Minimum Moves to Clean the Classroom, Two Sum, LRU Cache)... [Press '/' to focus]"
              className="w-full px-3 py-3.5 bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              autoComplete="off"
            />
            {isSearching && (
              <div className="mr-3 animate-spin text-[var(--accent-green)]">
                <Sparkles size={18} />
              </div>
            )}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                  inputRef.current?.focus();
                }}
                className="mr-3 p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => {
                if (query.trim()) fetchQuestionDetails(query.trim());
              }}
              className="mr-2 px-4 py-2 bg-[var(--accent-green)] hover:bg-[var(--accent-green)]/90 text-[#0e0f12] font-semibold text-xs sm:text-sm rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 shadow-sm"
            >
              Search
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-2xl z-50 overflow-hidden divide-y divide-[var(--border-subtle)]">
              <div className="px-3 py-2 bg-[var(--bg-surface)] text-[11px] font-semibold text-[var(--text-muted)] flex justify-between items-center">
                <span>Matching Problems ({suggestions.length})</span>
                <span className="mono">Use ↑ ↓ & Enter to select</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <div
                    key={item.slug}
                    onClick={() => handleSelectSuggestion(item)}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      idx === activeIndex
                        ? 'bg-[var(--accent-green-dim)] text-[var(--accent-green)]'
                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        {getDifficultyBadge(item.difficulty)}
                      </div>
                      {item.topics && (
                        <span className="text-xs text-[var(--text-muted)] truncate">
                          {item.topics.split(',').slice(0, 4).join(' • ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                        {item.company_count} {item.company_count === 1 ? 'Company' : 'Companies'}
                      </span>
                      <ChevronRight size={15} className="text-[var(--text-muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Searches (if any) */}
        {recentSearches.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <History size={13} className="text-[var(--text-muted)]" />
                <span>Recent Searches:</span>
              </div>
              <button
                onClick={clearRecentSearches}
                className="text-[11px] text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear recent searches"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleSelectPopular(s)}
                  className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
                >
                  <span>{s.name}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    s.difficulty === 'Easy' ? 'text-emerald-400' :
                    s.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {s.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Questions Quick Chips */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <Sparkles size={14} className="text-[var(--accent-green)]" />
            <span>Popular & Trending Lookups:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_QUESTIONS.map((q) => (
              <button
                key={q.slug}
                onClick={() => handleSelectPopular(q)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedSlug === q.slug
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold border-[var(--accent-green)] shadow-sm'
                    : 'bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                }`}
              >
                <span>{q.name}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  q.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' :
                  q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                }`}>
                  {q.difficulty}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Details Skeleton */}
      {isLoadingDetails && (
        <div className="data-surface p-12 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] text-center space-y-4 shadow-xl">
          <div className="animate-spin inline-block text-[var(--accent-green)]">
            <Sparkles size={36} />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Analyzing company question occurrences, timeframes & patterns...
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Searching 429+ company interview archives in database
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoadingDetails && (
        <div className="p-6 rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/10 text-red-400 flex items-start gap-3 shadow-lg">
          <HelpCircle size={22} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">Question Not Found</p>
            <p className="text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      {/* Question Details and Company Breakdown */}
      {details && !isLoadingDetails && (
        <div className="space-y-7 animate-in fade-in duration-200">
          {/* Problem Profile Card */}
          <div className="data-surface p-6 sm:p-7 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--bg-surface)] space-y-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--text-primary)]">
                    {details.title}
                  </h2>
                  {getDifficultyBadge(details.difficulty)}
                  {currentAttempt && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      {currentAttempt.status === 'solved' || currentAttempt.status === 'mastered' ? 'Solved' : 'Attempted'}
                    </span>
                  )}
                </div>

                {/* Topics / Tags */}
                {details.topics && details.topics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {details.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white transition-colors"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() =>
                    setSolveModalProblem({
                      title: details.title,
                      slug: details.slug,
                      difficulty: details.difficulty,
                      leetcode_url: details.leetcode_url,
                      topics: details.topics.join(', '),
                    })
                  }
                  className="px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--accent-green)] hover:bg-[var(--accent-green)]/90 text-[#0e0f12] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Play size={13} fill="currentColor" />
                  Solve Problem
                </button>

                <button
                  onClick={() => toggleBookmark(details.slug)}
                  className={`px-3 py-2 rounded-[var(--radius-sm)] border text-xs flex items-center gap-1.5 transition-all ${
                    isCurrentBookmarked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-semibold'
                      : 'bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title={isCurrentBookmarked ? 'Bookmarked' : 'Save to bookmarks'}
                >
                  {isCurrentBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                  <span>{isCurrentBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>

                {details.leetcode_url && (
                  <a
                    href={details.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>LeetCode</span>
                    <ExternalLink size={13} className="text-[var(--accent-green)]" />
                  </a>
                )}

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs flex items-center gap-1.5 transition-all"
                  title="Copy shareable link"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={13} />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Total Companies</span>
                <span className="text-xl sm:text-2xl font-bold mono text-[var(--accent-green)]">
                  {details.total_companies}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Interview Occurrences
                </span>
              </div>

              <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Peak Frequency</span>
                <span className="text-xl sm:text-2xl font-bold mono text-amber-400">
                  {Math.max(...details.companies.map((c) => c.max_frequency || 0), 0).toFixed(1)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Max Weight Score
                </span>
              </div>

              <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Recent 30 / 90 Days</span>
                <span className="text-xl sm:text-2xl font-bold mono text-emerald-400">
                  {details.timeframe_summary.in_30_days} / {details.timeframe_summary.in_90_days}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Active Hiring Rounds
                </span>
              </div>

              <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">All-Time Archive</span>
                <span className="text-xl sm:text-2xl font-bold mono text-purple-400">
                  {details.timeframe_summary.in_all_time}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Historical Records
                </span>
              </div>
            </div>

            {/* Top Companies Ranked Visual Distribution Chart */}
            {topCompaniesChart.length > 1 && (
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                    <BarChart2 size={15} className="text-[var(--accent-green)]" />
                    <span>Top Companies Asking This Question (Ranked by Frequency)</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mono">
                    Top {topCompaniesChart.length} of {details.total_companies}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {topCompaniesChart.map((c, i) => {
                    const pct = Math.min(100, Math.max(8, ((c.max_frequency || 0) / maxChartFreq) * 100));
                    return (
                      <Link
                        key={c.company}
                        href={`/company/${encodeURIComponent(c.company)}`}
                        className="p-2.5 rounded bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent-green)] transition-all space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-green)] transition-colors truncate">
                            #{i + 1} {c.company}
                          </span>
                          <span className="mono font-bold text-amber-400 text-[11px]">
                            {c.max_frequency.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Associated DSA Patterns Section */}
            {details.patterns && details.patterns.length > 0 && (
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <Layers size={14} className="text-[var(--accent-green)]" />
                  <span>Associated DSA Pattern Categories:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {details.patterns.map((p) => (
                    <Link
                      key={p.category_slug + p.url}
                      href={`/patterns/${p.category_slug}`}
                      className="px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--bg-base)] hover:border-[var(--accent-green)] border border-[var(--border-strong)] text-xs text-[var(--text-primary)] transition-all flex items-center gap-2 group shadow-sm"
                    >
                      <span className="group-hover:text-[var(--accent-green)] transition-colors font-medium">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] mono">
                        {p.accuracy ? `${p.accuracy}% acc` : p.difficulty}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Companies List Section Header & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Building2 size={18} className="text-[var(--accent-green)]" />
                  <span>Companies Asking This Question ({filteredCompanies.length})</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Showing {filteredCompanies.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
                  {Math.min(page * pageSize, filteredCompanies.length)} of {filteredCompanies.length} companies
                </p>
              </div>

              {/* View Toggle & Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search in companies */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Filter companies..."
                    className="pl-7 pr-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)]"
                  />
                </div>

                {/* Recency Timeframe Filter */}
                <select
                  value={timeframeFilter}
                  onChange={(e: any) => {
                    setTimeframeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--accent-green)]"
                >
                  <option value="ALL">All Timeframes ({details.total_companies})</option>
                  <option value="30_days">🔥 Recent 30 Days ({details.timeframe_summary.in_30_days})</option>
                  <option value="90_days">⚡ 90 Days ({details.timeframe_summary.in_90_days})</option>
                  <option value="6_months">6 Months ({details.timeframe_summary.in_6_months})</option>
                  <option value="more_than_six_months">&gt; 6 Months ({details.timeframe_summary.in_more_than_six_months})</option>
                </select>

                {/* Category / Tier Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e: any) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--accent-green)]"
                >
                  <option value="ALL">All Company Tiers</option>
                  <option value="big_tech">🏛️ MAANG & Big Tech</option>
                  <option value="fintech">💹 FinTech & Finance</option>
                  <option value="unicorns">🦄 Unicorns & Startups</option>
                  <option value="services">🏢 Global IT & Enterprise</option>
                </select>

                {/* Sort Order */}
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--accent-green)]"
                >
                  <option value="frequency">Sort: Highest Frequency</option>
                  <option value="recency">Sort: Most Recent</option>
                  <option value="alpha">Sort: Company A-Z</option>
                </select>

                {/* Grid vs Table View Toggle */}
                <div className="flex items-center bg-[var(--bg-surface)] p-0.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-green)] font-semibold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      viewMode === 'table'
                        ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-green)] font-semibold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Compact Table View"
                  >
                    <TableIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty filter results */}
            {filteredCompanies.length === 0 ? (
              <div className="p-12 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-2">
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  No companies match your selected filters.
                </p>
                <button
                  onClick={() => {
                    setCompanySearch('');
                    setTimeframeFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="text-xs text-[var(--accent-green)] hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid Card View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {paginatedCompanies.map((comp) => (
                  <div
                    key={comp.company}
                    className="data-surface p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] hover:border-[var(--accent-green)]/60 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-raised)] transition-all flex flex-col justify-between gap-3 group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/company/${encodeURIComponent(comp.company)}`}
                          className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-green)] transition-colors flex items-center gap-1.5"
                        >
                          <Building2 size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)]" />
                          <span className="truncate">{comp.company}</span>
                        </Link>
                        <span className="mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-amber-400">
                          {comp.max_frequency.toFixed(1)} freq
                        </span>
                      </div>

                      {/* Timeframe Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {comp.timeframes.map((tf) => getTimeframeBadge(tf))}
                      </div>

                      {/* Hiring Tracks if applicable */}
                      {comp.hiring_tracks && comp.hiring_tracks.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {comp.hiring_tracks.map((track) => (
                            <span
                              key={track}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            >
                              Track: {track}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
                      <Link
                        href={`/company/${encodeURIComponent(comp.company)}`}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 font-medium transition-colors"
                      >
                        <span>Company Roadmap</span>
                        <ArrowRight size={12} />
                      </Link>

                      <button
                        onClick={() =>
                          setSolveModalProblem({
                            title: details.title,
                            slug: details.slug,
                            difficulty: details.difficulty,
                            leetcode_url: details.leetcode_url,
                            company: comp.company,
                            topics: details.topics.join(', '),
                          })
                        }
                        className="text-[var(--accent-green)] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Play size={10} fill="currentColor" />
                        <span>Practice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Compact Table View */
              <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-surface-raised)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Frequency</th>
                      <th className="py-3 px-4">Timeframe Records</th>
                      <th className="py-3 px-4">Hiring Tracks</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {paginatedCompanies.map((comp, idx) => (
                      <tr
                        key={comp.company}
                        className="hover:bg-[var(--bg-surface-raised)] transition-colors group"
                      >
                        <td className="py-2.5 px-4 mono text-[var(--text-muted)]">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[var(--text-primary)]">
                          <Link
                            href={`/company/${encodeURIComponent(comp.company)}`}
                            className="group-hover:text-[var(--accent-green)] transition-colors flex items-center gap-1.5"
                          >
                            <Building2 size={13} className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)]" />
                            <span>{comp.company}</span>
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 mono font-semibold text-amber-400">
                          {comp.max_frequency.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {comp.timeframes.map((tf) => getTimeframeBadge(tf))}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          {comp.hiring_tracks && comp.hiring_tracks.length > 0 ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {comp.hiring_tracks.join(', ')}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() =>
                              setSolveModalProblem({
                                title: details.title,
                                slug: details.slug,
                                difficulty: details.difficulty,
                                leetcode_url: details.leetcode_url,
                                company: comp.company,
                                topics: details.topics.join(', '),
                              })
                            }
                            className="px-2.5 py-1 rounded bg-[var(--bg-base)] hover:bg-[var(--accent-green)] text-[var(--text-secondary)] hover:text-[#0e0f12] font-semibold border border-[var(--border-subtle)] transition-all"
                          >
                            Practice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                <div>
                  Page <span className="font-bold text-[var(--text-primary)] mono">{page}</span> of{' '}
                  <span className="font-bold text-[var(--text-primary)] mono">{totalPages}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-raised)] disabled:opacity-40 disabled:pointer-events-none border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-7 h-7 rounded text-xs font-semibold mono transition-colors ${
                          page === pageNum
                            ? 'bg-[var(--accent-green)] text-[#0e0f12]'
                            : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-1 text-[var(--text-muted)]">...</span>}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-raised)] disabled:opacity-40 disabled:pointer-events-none border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Problem Solve Modal */}
      {solveModalProblem && (
        <ProblemSolveModal
          isOpen={!!solveModalProblem}
          onClose={() => {
            setSolveModalProblem(null);
            setUserAttempts(getProblemAttempts());
          }}
          problem={{
            id: solveModalProblem.slug,
            title: solveModalProblem.title,
            slug: solveModalProblem.slug,
            difficulty: solveModalProblem.difficulty,
            company: solveModalProblem.company,
            url: solveModalProblem.leetcode_url,
          }}
          onSuccess={() => setUserAttempts(getProblemAttempts())}
        />
      )}
    </div>
  );
}
