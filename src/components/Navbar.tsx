'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Layers, Building2, Terminal } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AutocompleteCompany {
  company: string;
  count: number;
}

interface AutocompletePattern {
  category: string;
  slug: string;
  group: string;
  count: number;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [companyResults, setCompanyResults] = useState<AutocompleteCompany[]>([]);
  const [patternResults, setPatternResults] = useState<AutocompletePattern[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global "/" hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (!query.trim()) {
      setCompanyResults([]);
      setPatternResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [compRes, patRes] = await Promise.all([
          fetch(`/api/companies?search=${encodeURIComponent(query)}&limit=6`),
          fetch(`/api/patterns?search=${encodeURIComponent(query)}&limit=6`),
        ]);

        if (compRes.ok && patRes.ok) {
          const compData = await compRes.json();
          const patData = await patRes.json();
          setCompanyResults(compData.companies?.slice(0, 6) || []);
          setPatternResults(patData.patterns?.slice(0, 6) || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = (companyName: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/company/${encodeURIComponent(companyName)}`);
  };

  const handleSelectPattern = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/patterns/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (patternResults.length > 0) {
        handleSelectPattern(patternResults[0].slug);
      } else if (companyResults.length > 0) {
        handleSelectCompany(companyResults[0].company);
      }
    }
  };

  const isPatternsActive = pathname.startsWith('/patterns');
  const isCompaniesActive = !isPatternsActive;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] group-hover:border-[var(--accent-green)] flex items-center justify-center transition-all shadow-sm">
            <Terminal size={17} className="text-[var(--accent-green)] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] group-hover:text-white transition-colors">
                LeetCamp
              </span>
              <span className="text-[10px] mono font-semibold bg-[var(--bg-surface-raised)] text-[var(--accent-green)] border border-[var(--border-subtle)] px-1.5 py-0.2 rounded">
                v2.0
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] leading-tight">
              429 Companies · 48 Patterns
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center bg-[var(--bg-surface)] border border-[var(--border-strong)] focus-within:border-[var(--accent-green)] px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors">
            <Search size={15} className="text-[var(--text-muted)] mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search companies or DSA patterns..."
              className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs sm:text-sm focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 ml-1"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] select-none font-mono rounded">
                /
              </kbd>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (patternResults.length > 0 || companyResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-xl z-50 overflow-hidden text-xs max-h-96 overflow-y-auto rounded-[var(--radius-md)]">
              {/* Pattern Suggestions */}
              {patternResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 label-caps bg-[var(--bg-surface-raised)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <span>DSA Patterns</span>
                    <span className="mono">{patternResults.length} matches</span>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {patternResults.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => handleSelectPattern(p.slug)}
                        className="w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors group"
                      >
                        <div>
                          <span className="font-medium text-sm text-[var(--text-primary)] group-hover:text-white">
                            {p.category}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] ml-2">
                            ({p.group})
                          </span>
                        </div>
                        <span className="chip chip-basic">
                          {p.count} Qs
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Suggestions */}
              {companyResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 label-caps bg-[var(--bg-surface-raised)] border-t border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <span>Companies</span>
                    <span className="mono">{companyResults.length} matches</span>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {companyResults.map((c) => (
                      <button
                        key={c.company}
                        onClick={() => handleSelectCompany(c.company)}
                        className="w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors group"
                      >
                        <span className="font-medium text-sm text-[var(--text-primary)] group-hover:text-white">
                          {c.company}
                        </span>
                        <span className="chip chip-medium">
                          {c.count} Qs
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
              isCompaniesActive && pathname === '/'
                ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Companies
          </Link>
          <Link
            href="/patterns"
            className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
              isPatternsActive
                ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            DSA Patterns
          </Link>

          {/* Eye Comfort Theme Switcher */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
