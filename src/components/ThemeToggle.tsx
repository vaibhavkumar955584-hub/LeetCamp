'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Palette, Check } from 'lucide-react';

export type ThemeMode = 'green' | 'amber' | 'dim' | 'cyan';

const THEMES: { id: ThemeMode; label: string; dotColor: string }[] = [
  { id: 'green', label: 'Emerald Dark', dotColor: '#4ade80' },
  { id: 'amber', label: 'Amber Warm', dotColor: '#fbbf24' },
  { id: 'dim', label: 'Dim Charcoal', dotColor: '#a7f3d0' },
  { id: 'cyan', label: 'Cyber Cyan', dotColor: '#38bdf8' },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('green');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('leetcamp_theme') as ThemeMode;
    if (saved && ['green', 'amber', 'dim', 'cyan'].includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'green');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('leetcamp_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsOpen(false);
  };

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div ref={containerRef} className="relative text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] hover:border-[var(--accent-green)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
        title="Theme Palette"
      >
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: current.dotColor }}
        />
        <span className="font-medium hidden md:inline">{current.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 data-surface shadow-xl z-50 py-1.5 overflow-hidden">
          <div className="px-3 py-1 label-caps border-b border-[var(--border-subtle)]">
            Theme Palette
          </div>
          <div className="py-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                  theme === t.id
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span>{t.label}</span>
                </div>
                {theme === t.id && <Check size={13} className="text-[var(--accent-green)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
