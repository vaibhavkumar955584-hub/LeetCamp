'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, X, Search, Layers, Flame, ArrowRight, Target, Zap, Scale } from 'lucide-react';
import { CompanySummary } from '@/lib/db';
import CompanyCard from './CompanyCard';

interface CompanyDirectoryProps {
  initialCompanies: CompanySummary[];
}

const ALPHABETS = [
  'ALL',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const TOP_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Bloomberg',
  'Uber', 'Adobe', 'Oracle', 'Goldman Sachs', 'ByteDance', 'Netflix',
];

export function CompanyDirectory({ initialCompanies }: CompanyDirectoryProps) {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'count-desc' | 'count-asc' | 'alpha-asc' | 'alpha-desc'>('count-desc');

  // Total deduplicated company-specific questions
  const totalCompanyQuestions = useMemo(() => {
    return initialCompanies.reduce((acc, c) => acc + c.count, 0);
  }, [initialCompanies]);

  // Featured Top Companies list
  const featuredList = useMemo(() => {
    return TOP_COMPANIES.map((name) =>
      initialCompanies.find((c) => c.company.toLowerCase() === name.toLowerCase())
    ).filter(Boolean) as CompanySummary[];
  }, [initialCompanies]);

  // Filtered companies for directory grid
  const filteredCompanies = useMemo(() => {
    return initialCompanies
      .filter((item) => {
        if (search.trim()) {
          const s = search.toLowerCase().trim();
          if (!item.company.toLowerCase().includes(s)) {
            return false;
          }
        }

        if (selectedLetter !== 'ALL') {
          const firstChar = item.company.charAt(0).toUpperCase();
          if (firstChar !== selectedLetter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'count-desc') return b.count - a.count;
        if (sortBy === 'count-asc') return a.count - b.count;
        if (sortBy === 'alpha-asc') return a.company.localeCompare(b.company);
        if (sortBy === 'alpha-desc') return b.company.localeCompare(a.company);
        return 0;
      });
  }, [initialCompanies, search, selectedLetter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedLetter('ALL');
    setSortBy('count-desc');
  };

  return (
    <div className="space-y-8 w-full mx-auto">
      {/* Hero Header Section — LeetCamp v3 */}
      <div className="data-surface p-5 sm:p-7 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-semibold">
                LeetCamp v3.0 • Preparation Platform
              </span>
              <span className="text-xs text-[var(--text-muted)] mono hidden sm:inline">
                {initialCompanies.length} Companies · 48 Patterns · 17.3K+ Questions
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Prepare smarter. Solve what companies actually ask.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Practice company-specific LeetCode problems organized by frequency, difficulty, recency, and DSA pattern. Tell LeetCamp your target company and timeline, and get your personalized daily mission path.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/prepare"
                className="btn-primary py-2 px-5 text-sm font-semibold shadow-md bg-[var(--accent-green)] text-[#0e0f12] hover:bg-[var(--accent-green)]/90 flex items-center gap-2"
              >
                <Target size={16} />
                <span>Build My Preparation Plan</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/practice"
                className="btn-primary py-2 px-4 text-sm text-[var(--text-primary)] flex items-center gap-1.5"
              >
                <Zap size={15} className="text-[#f59e0b]" />
                <span>Smart Practice</span>
              </Link>
              <Link
                href="/compare"
                className="btn-primary py-2 px-4 text-sm text-[var(--text-primary)] flex items-center gap-1.5"
              >
                <Scale size={15} className="text-[#3b82f6]" />
                <span>Compare Overlaps</span>
              </Link>
            </div>
          </div>

          {/* Quick Popular Company Picks */}
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-4 rounded-[var(--radius-md)] space-y-2.5 shrink-0 lg:w-80">
            <span className="label-caps block text-[var(--text-muted)]">Popular Quick Picks</span>
            <div className="flex flex-wrap gap-1.5">
              {['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'TCS', 'Infosys', 'Bloomberg'].map((comp) => (
                <Link
                  key={comp}
                  href={`/company/${encodeURIComponent(comp)}`}
                  className="px-2.5 py-1 text-xs rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-green)] hover:text-white transition-colors"
                >
                  {comp}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Core Value Cards — LeetCamp v3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <Link
            href="/prepare"
            className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--accent-green)] transition-all flex flex-col justify-between gap-3 group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={18} className="text-[var(--accent-green)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white">
                  🎯 COMPANY PREP
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Target a specific company and prepare strategically with a customized 7 to 90-day daily mission plan.
              </p>
            </div>
            <span className="text-xs text-[var(--accent-green)] font-semibold inline-flex items-center gap-1">
              <span>Start Plan</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/patterns"
            className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] hover:border-[#3b82f6] transition-all flex flex-col justify-between gap-3 group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Layers size={18} className="text-[#3b82f6]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white">
                  🧠 DSA ROADMAP
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Master 48 patterns in the right order from Core Data Structures to Dynamic Programming and Graphs.
              </p>
            </div>
            <span className="text-xs text-[#3b82f6] font-semibold inline-flex items-center gap-1">
              <span>Explore Patterns</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/practice"
            className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] hover:border-[#f59e0b] transition-all flex flex-col justify-between gap-3 group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Zap size={18} className="text-[#f59e0b]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white">
                  ⚡ QUICK PRACTICE & MOCK
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Get problems matched to your available time (10m–90m) or simulate a 45-minute timed technical mock interview.
              </p>
            </div>
            <span className="text-xs text-[#f59e0b] font-semibold inline-flex items-center gap-1">
              <span>Practice Now</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-[var(--border-subtle)]">
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 sm:p-4 rounded-[var(--radius-md)]">
            <span className="label-caps block">Companies</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mono">
              {initialCompanies.length}
            </span>
          </div>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 sm:p-4 rounded-[var(--radius-md)]">
            <span className="label-caps block">Company Questions</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--diff-medium)] mono">
              {totalCompanyQuestions.toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 sm:p-4 rounded-[var(--radius-md)]">
            <span className="label-caps block">Unique Catalog</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--accent-green)] mono">
              3,392
            </span>
          </div>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] p-3.5 sm:p-4 rounded-[var(--radius-md)]">
            <span className="label-caps block">DSA Patterns Hub</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--diff-basic)] mono">
              48 Topics
            </span>
          </div>
        </div>
      </div>

      {/* Featured / High-Frequency Companies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[var(--diff-medium)]" />
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
              Top Tracked Companies
            </h2>
            <span className="text-xs text-[var(--text-muted)] mono hidden sm:inline">
              (High Frequency Targets)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-3.5">
          {featuredList.map((comp) => (
            <CompanyCard
              key={comp.company}
              name={comp.company}
              totalQuestions={comp.count}
              easy={comp.easy_count}
              medium={comp.medium_count}
              hard={comp.hard_count}
            />
          ))}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="data-surface p-4 space-y-3.5 sticky top-16 z-20 backdrop-blur-md bg-[var(--bg-surface)]/95 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 flex items-center bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus-within:border-[var(--accent-green)] px-3.5 py-2 rounded-[var(--radius-sm)] transition-colors">
            <Search size={16} className="text-[var(--text-muted)] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies (e.g. Amazon, Google, Meta, Peak6, Dream11)..."
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

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs px-3 py-2 rounded-[var(--radius-sm)] focus:border-[var(--accent-green)] focus:outline-none cursor-pointer"
            >
              <option value="count-desc">Most Questions</option>
              <option value="count-asc">Fewest Questions</option>
              <option value="alpha-asc">Alphabetical (A-Z)</option>
              <option value="alpha-desc">Alphabetical (Z-A)</option>
            </select>

            {(search || selectedLetter !== 'ALL' || sortBy !== 'count-desc') && (
              <button
                onClick={clearFilters}
                className="btn-primary text-[var(--diff-hard)] hover:border-[var(--diff-hard)]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Alphabet Navigation Pills */}
        <div className="flex flex-wrap gap-1 items-center border-t border-[var(--border-subtle)] pt-3">
          <span className="label-caps mr-2 hidden sm:inline">Index:</span>
          {ALPHABETS.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2.5 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
                  isSelected
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1 mono">
          <span>
            Showing <strong className="text-[var(--text-primary)]">{filteredCompanies.length}</strong> of {initialCompanies.length} organizations
          </span>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="data-surface p-12 text-center space-y-3">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No matching companies found
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              No organizations matched query: &quot;{search}&quot;
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary mt-2"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-3.5">
            {filteredCompanies.map((comp) => (
              <CompanyCard
                key={comp.company}
                name={comp.company}
                totalQuestions={comp.count}
                easy={comp.easy_count}
                medium={comp.medium_count}
                hard={comp.hard_count}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
