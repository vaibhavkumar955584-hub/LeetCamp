'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'green' | 'amber' | 'dim' | 'cyan';

const THEMES: { id: ThemeMode; label: string; dotColor: string }[] = [
  { id: 'green', label: 'PHOSPHOR', dotColor: '#4ade80' },
  { id: 'amber', label: 'AMBER CRT', dotColor: '#fbbf24' },
  { id: 'dim', label: 'DIM NIGHT', dotColor: '#a7f3d0' },
  { id: 'cyan', label: 'CYBER CYAN', dotColor: '#38bdf8' },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('green');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('leetcamp_theme') as ThemeMode;
    if (saved && ['green', 'amber', 'dim', 'cyan'].includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      // Default to green phosphor
      document.documentElement.setAttribute('data-theme', 'green');
    }
  }, []);

  const changeTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('leetcamp_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsOpen(false);
  };

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div className="relative font-mono text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 border border-[#233823] bg-[#151c15] hover:border-[#4ade80] text-[#86a789] hover:text-[#4ade80] transition-colors rounded-sm shadow-sm"
        title="Switch Terminal Phosphor Theme"
      >
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: current.dotColor }}
        />
        <span className="font-bold hidden md:inline">[{current.label}]</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-40 border border-[#233823] bg-[#151c15] shadow-2xl z-50 py-1 divide-y divide-[#233823]/60">
          <div className="px-2.5 py-1 text-[10px] text-[#5e7e61] font-bold">
            PALETTE_SELECT:
          </div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between text-xs transition-colors ${
                theme === t.id
                  ? 'bg-[#1b261b] text-white font-bold'
                  : 'text-[#86a789] hover:bg-[#1b261b] hover:text-[#4ade80]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: t.dotColor }}
                />
                <span>{t.label}</span>
              </div>
              {theme === t.id && <span className="text-[10px]">★</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
