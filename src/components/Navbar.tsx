'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { X, Layers, Building2, Search } from 'lucide-react';
import { CompanySummary, PatternSummary } from '@/lib/db';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanySummary[]>([]);
  const [patternResults, setPatternResults] = useState<PatternSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search for company & pattern suggestions
  useEffect(() => {
    if (!query.trim()) {
      setCompanyResults([]);
      setPatternResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [compRes, patRes] = await Promise.all([
          fetch(`/api/companies?search=${encodeURIComponent(query.trim())}`),
          fetch(`/api/patterns?search=${encodeURIComponent(query.trim())}`),
        ]);

        if (compRes.ok) {
          const compData = await compRes.json();
          setCompanyResults(compData.slice(0, 6));
        }
        if (patRes.ok) {
          const patData = await patRes.json();
          setPatternResults(patData.slice(0, 6));
        }
        setIsOpen(true);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Global hotkey '/' to focus search
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = (companyName: string) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/company/${encodeURIComponent(companyName)}`);
  };

  const handleSelectPattern = (patternSlug: string) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/patterns/${encodeURIComponent(patternSlug)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (patternResults.length > 0) {
        handleSelectPattern(patternResults[0].slug);
      } else if (companyResults.length > 0) {
        handleSelectCompany(companyResults[0].company);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isPatternsActive = pathname.startsWith('/patterns');
  const isCompaniesActive = !isPatternsActive;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a2e1a] bg-[#0b0f0a]/95 backdrop-blur-sm font-mono text-xs text-[#33ff66]">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-6">
        {/* Masthead */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-8 h-8 rounded bg-[#0f170e] border border-[#2d4f2d] group-hover:border-[#33ff66] flex items-center justify-center transition-all shadow-[0_0_8px_rgba(51,255,102,0.15)] group-hover:shadow-[0_0_12px_rgba(51,255,102,0.4)] overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_2px]" />
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-[#33ff66] group-hover:scale-110 transition-transform"
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
              <span className="font-arcade text-[11px] sm:text-xs text-[#33ff66] tracking-wider group-hover:text-white transition-colors crt-glow">
                LEETCAMP.SYS
              </span>
              <span className="text-[10px] text-[#0b0f0a] bg-[#33ff66] px-1 py-0.2 font-mono font-bold leading-none">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-[#62ad6a] tracking-tight font-mono">
              INTERVIEW_ARCHIVE // 48_PATTERNS
            </span>
          </div>
        </Link>

        {/* Global Terminal Search */}
        <div ref={searchRef} className="relative flex-1 max-w-sm md:max-w-xl">
          <div className="relative flex items-center bg-[#0b0f0a] border border-[#1a2e1a] focus-within:border-[#33ff66] px-2.5 py-1.5 transition-colors">
            <span className="text-[#33ff66] select-none font-bold mr-1.5">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="SEARCH_TERMINAL (Company or Pattern): _"
              className="w-full bg-transparent text-[#33ff66] placeholder-[#62ad6a] text-xs sm:text-sm focus:outline-none font-mono"
            />
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="text-[#62ad6a] hover:text-[#33ff66] ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-[#62ad6a] border border-[#1a2e1a] select-none font-bold">
                /
              </kbd>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (patternResults.length > 0 || companyResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0f0a] border border-[#33ff66] shadow-2xl z-50 overflow-hidden font-mono text-xs max-h-96 overflow-y-auto">
              {/* Pattern Suggestions */}
              {patternResults.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-[#0b0f0a] bg-[#33ff66] font-bold flex items-center justify-between">
                    <span>MATCHING DSA PATTERNS [{patternResults.length}]</span>
                    <span>[ROADMAP]</span>
                  </div>
                  <div className="divide-y divide-[#1a2e1a]">
                    {patternResults.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => handleSelectPattern(p.slug)}
                        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {p.category.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#62ad6a] group-hover:text-[#0b0f0a]">
                            ({p.group})
                          </span>
                        </div>
                        <span className="text-xs text-[#62ad6a] group-hover:text-[#0b0f0a] font-bold">
                          [{p.count} QUESTIONS]
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Suggestions */}
              {companyResults.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-[#33ff66] bg-[#0f170e] border-t border-b border-[#1a2e1a] font-bold flex items-center justify-between">
                    <span>MATCHING COMPANIES [{companyResults.length}]</span>
                    <span>[COMPANY ARCHIVE]</span>
                  </div>
                  <div className="divide-y divide-[#1a2e1a]">
                    {companyResults.map((c) => (
                      <button
                        key={c.company}
                        onClick={() => handleSelectCompany(c.company)}
                        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#33ff66] hover:text-[#0b0f0a] transition-colors group"
                      >
                        <span className="font-bold text-sm">
                          {c.company.toUpperCase()}.SYS
                        </span>
                        <span className="text-xs text-[#62ad6a] group-hover:text-[#0b0f0a] font-bold">
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

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className={`px-2.5 py-1 text-xs border transition-colors font-bold ${
              isCompaniesActive && pathname === '/'
                ? 'bg-[#33ff66] text-[#0b0f0a] border-[#33ff66]'
                : 'text-[#33ff66] border-[#1a2e1a] hover:border-[#33ff66] hover:bg-[#33ff66] hover:text-[#0b0f0a]'
            }`}
          >
            [COMPANIES]
          </Link>
          <Link
            href="/patterns"
            className={`px-2.5 py-1 text-xs border transition-colors font-bold ${
              isPatternsActive
                ? 'bg-[#33ff66] text-[#0b0f0a] border-[#33ff66]'
                : 'text-[#33ff66] border-[#1a2e1a] hover:border-[#33ff66] hover:bg-[#33ff66] hover:text-[#0b0f0a]'
            }`}
          >
            [DSA PATTERNS]
          </Link>
          <span className="px-2 py-1 text-xs text-[#62ad6a] border border-[#1a2e1a] hidden xl:inline font-bold">
            [ONLINE]
          </span>
        </div>
      </div>
    </header>
  );
}
