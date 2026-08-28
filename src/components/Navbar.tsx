'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { CompanySummary } from '@/lib/db';

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompanySummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search for company suggestions
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/companies?search=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 10));
          setIsOpen(true);
        }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelectCompany(results[0].company);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1a2e1a] bg-[#0b0f0a]/95 backdrop-blur-sm font-mono text-xs text-[#33ff66]">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-6">
        {/* LEETCAMP Terminal Masthead with Custom CRT Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-8 h-8 rounded bg-[#0f170e] border border-[#2d4f2d] group-hover:border-[#33ff66] flex items-center justify-center transition-all shadow-[0_0_8px_rgba(51,255,102,0.15)] group-hover:shadow-[0_0_12px_rgba(51,255,102,0.4)] overflow-hidden">
            {/* Mini Scanlines */}
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
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-[#62ad6a] tracking-tight font-mono">
              INTERVIEW_LEADERBOARD
            </span>
          </div>
        </Link>

        {/* Full-width Responsive Search Prompt */}
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
              placeholder="SEARCH_COMPANY: _"
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

          {/* Autocomplete Dropdown styled like CLI result set */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0f0a] border border-[#33ff66] shadow-2xl z-50 overflow-hidden font-mono text-xs">
              <div className="px-3 py-1 text-xs uppercase tracking-wider text-[#0b0f0a] bg-[#33ff66] font-bold">
                MATCHING ORGANIZATIONS [{results.length}]
              </div>
              <div className="divide-y divide-[#1a2e1a] max-h-72 overflow-y-auto">
                {results.map((c) => (
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

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="px-2.5 py-1 text-xs text-[#33ff66] hover:bg-[#33ff66] hover:text-[#0b0f0a] border border-[#1a2e1a] hover:border-[#33ff66] transition-colors font-bold"
          >
            [DIRECTORY]
          </Link>
          <span className="px-2 py-1 text-xs text-[#62ad6a] border border-[#1a2e1a] hidden sm:inline font-bold">
            [ONLINE]
          </span>
        </div>
      </div>
    </header>
  );
}
