'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Terminal,
  Compass,
  Target,
  Building2,
  Layers,
  Zap,
  BarChart3,
  Scale,
  Search,
  Flame,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';
import { getUserStats } from '@/lib/userProgress';

export function Navbar() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [streakDays, setStreakDays] = useState(1);

  // Read streak from userProgress on client mount
  useEffect(() => {
    try {
      const stats = getUserStats();
      if (stats.streakDays) setStreakDays(stats.streakDays);
    } catch {
      // fallback
    }
  }, []);

  // Global Ctrl+K / Cmd+K and "/" hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { href: '/prepare', label: 'Prepare', icon: Target, active: pathname.startsWith('/prepare') },
    { href: '/', label: 'Companies', icon: Building2, active: pathname === '/' || pathname.startsWith('/company') },
    { href: '/patterns', label: 'Patterns', icon: Layers, active: pathname.startsWith('/patterns') },
    { href: '/practice', label: 'Practice', icon: Zap, active: pathname.startsWith('/practice') },
    { href: '/progress', label: 'Progress', icon: BarChart3, active: pathname.startsWith('/progress') },
    { href: '/compare', label: 'Compare', icon: Scale, active: pathname.startsWith('/compare') },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="max-w-[1840px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-16 flex items-center justify-between gap-4">
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
                <span className="text-[10px] mono font-semibold bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 px-1.5 py-0.2 rounded">
                  v3.0
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] leading-tight hidden sm:inline">
                Personalized Interview Prep
              </span>
            </div>
          </Link>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
                    item.active
                      ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Icon size={14} className={item.active ? 'text-[#0e0f12]' : 'text-[var(--text-muted)]'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Trigger, Streak & Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Command Trigger Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs transition-all shadow-sm"
              title="Search LeetCamp (Ctrl + K)"
            >
              <Search size={14} className="text-[var(--accent-green)]" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] mono bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </button>

            {/* Streak Counter */}
            <Link
              href="/progress"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-[var(--accent-green)] transition-all"
              title="Current daily streak"
            >
              <Flame size={14} className="text-[#f59e0b] fill-[#f59e0b]/20" />
              <span className="mono font-semibold text-xs">{streakDays}d</span>
            </Link>

            {/* Eye Comfort Theme Switcher */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Bottom Sub-Navigation */}
        <div className="md:hidden flex items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2 px-2 overflow-x-auto text-[11px]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  item.active ? 'text-[var(--accent-green)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
