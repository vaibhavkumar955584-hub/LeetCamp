'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Layers, Building2 } from 'lucide-react';
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

  // Fetch search suggestions (companies + patterns)
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
    <header className="sticky top-0 z-40 w-full border-b border-[#233823] bg-[#111611]/95 backdrop-blur-md font-mono text-xs text-[#4ade80]">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-6">
        {/* Masthead */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-8 h-8 rounded bg-[#151c15] border border-[#233823] group-hover:border-[#4ade80] flex items-center justify-center transition-all shadow-[0_0_8px_rgba(74,222,128,0.15)] group-hover:shadow-[0_0_12px_rgba(74,222,128,0.4)] overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px]" />
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-[#4ade80] group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 7 10 12 4 17" />
              <line x1="13" y1="17" x2="20" y2="17" strokeWidth="3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-arcade text-[11px] sm:text-xs text-[#4ade80] tracking-wider group-hover:text-white transition-colors crt-glow">
                LEETCAMP.SYS
              </span>
              <span className="text-[10px] text-[#111611] bg-[#4ade80] px-1 py-0.2 font-mono font-bold leading-none">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-[#86a789] tracking-tight font-mono">
              INTERVIEW_ARCHIVE // 48_PATTERNS
            </span>
          </div>
        </Link>

        {/* Global Terminal Search */}
        <div ref={searchRef} className="relative flex-1 max-w-sm md:max-w-xl">
          <div className="relative flex items-center bg-[#151c15] border border-[#233823] focus-within:border-[#4ade80] px-2.5 py-1.5 transition-colors rounded-sm">
            <span className="text-[#4ade80] select-none font-bold mr-1.5">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="SEARCH_TERMINAL (Company or Pattern): _"
              className="w-full bg-transparent text-[#4ade80] placeholder-[#5e7e61] text-xs sm:text-sm focus:outline-none font-mono"
            />
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="text-[#86a789] hover:text-[#4ade80] p-0.5 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-[#86a789] border border-[#233823] bg-[#111611] select-none font-bold rounded-sm">
                /
              </kbd>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (patternResults.length > 0 || companyResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#151c15] border border-[#4ade80] shadow-2xl z-50 overflow-hidden font-mono text-xs max-h-96 overflow-y-auto rounded-sm">
              {/* Pattern Suggestions */}
              {patternResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#111611] bg-[#4ade80] font-bold flex items-center justify-between">
                    <span>MATCHING DSA PATTERNS [{patternResults.length}]</span>
                    <span>[ROADMAP]</span>
                  </div>
                  <div className="divide-y divide-[#233823]">
                    {patternResults.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => handleSelectPattern(p.slug)}
                        className="w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-[#4ade80] hover:text-[#111611] transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {p.category.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#86a789] group-hover:text-[#111611]">
                            ({p.group})
                          </span>
                        </div>
                        <span className="text-xs text-[#fbbf24] group-hover:text-[#111611] font-bold bg-[#111611]/40 px-1.5 py-0.5 rounded-sm">
                          [{p.count} PROBLEMS]
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Suggestions */}
              {companyResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#4ade80] bg-[#1b261b] border-t border-b border-[#233823] font-bold flex items-center justify-between">
                    <span>MATCHING COMPANIES [{companyResults.length}]</span>
                    <span>[COMPANY ARCHIVE]</span>
                  </div>
                  <div className="divide-y divide-[#233823]">
                    {companyResults.map((c) => (
                      <button
                        key={c.company}
                        onClick={() => handleSelectCompany(c.company)}
                        className="w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-[#4ade80] hover:text-[#111611] transition-colors group"
                      >
                        <span className="font-bold text-sm">
                          {c.company.toUpperCase()}
                        </span>
                        <span className="text-xs text-[#fbbf24] group-hover:text-[#111611] font-bold bg-[#111611]/40 px-1.5 py-0.5 rounded-sm">
                          [{c.count} QUESTIONS]
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation & Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className={`px-2.5 py-1 text-xs border transition-colors font-bold rounded-sm ${
              isCompaniesActive && pathname === '/'
                ? 'bg-[#4ade80] text-[#111611] border-[#4ade80]'
                : 'text-[#4ade80] border-[#233823] hover:border-[#4ade80] hover:bg-[#1b261b]'
            }`}
          >
            [COMPANIES]
          </Link>
          <Link
            href="/patterns"
            className={`px-2.5 py-1 text-xs border transition-colors font-bold rounded-sm ${
              isPatternsActive
                ? 'bg-[#4ade80] text-[#111611] border-[#4ade80]'
                : 'text-[#4ade80] border-[#233823] hover:border-[#4ade80] hover:bg-[#1b261b]'
            }`}
          >
            [DSA PATTERNS]
          </Link>

          {/* Eye Comfort Theme Switcher */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
