'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  Layers,
  Sparkles,
  Flame,
  ArrowRight,
  X,
  Target,
  Trophy,
  Compass
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Actions' | 'Companies' | 'Patterns' | 'Problems';
  href: string;
}

const QUICK_ACTIONS: SearchItem[] = [
  { id: 'act-prepare', title: 'Build New Preparation Plan', subtitle: 'Personalized 7 to 90-day company roadmap', category: 'Actions', href: '/prepare' },
  { id: 'act-mock', title: 'Start 45-Min Mock Interview', subtitle: 'Timed assessment simulator', category: 'Actions', href: '/practice?mode=mock' },
  { id: 'act-progress', title: 'My Analytics & Weak Areas', subtitle: 'View streaks, win rates & milestones', category: 'Actions', href: '/progress' },
  { id: 'act-compare', title: 'Compare Target Companies', subtitle: 'Overlap matrix & common interview questions', category: 'Actions', href: '/compare' },
];

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<SearchItem[]>(QUICK_ACTIONS);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      setItems(QUICK_ACTIONS);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setItems(QUICK_ACTIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [compRes, patRes, probRes] = await Promise.all([
          fetch(`/api/companies?search=${encodeURIComponent(query)}&limit=5`),
          fetch(`/api/patterns?search=${encodeURIComponent(query)}`),
          fetch(`/api/questions/search?q=${encodeURIComponent(query)}&limit=5`),
        ]);

        const newItems: SearchItem[] = [];

        if (probRes.ok) {
          const probData = await probRes.json();
          if (Array.isArray(probData.results)) {
            probData.results.slice(0, 4).forEach((p: any) => {
              newItems.push({
                id: `prob-${p.slug}`,
                title: p.title,
                subtitle: `${p.difficulty} • Asked by ${p.company_count} ${p.company_count === 1 ? 'Company' : 'Companies'} (${p.sample_companies?.join(', ') || ''})`,
                category: 'Problems',
                href: `/lookup?q=${encodeURIComponent(p.slug)}`,
              });
            });
          }
        }

        if (compRes.ok) {
          const compData = await compRes.json();
          if (Array.isArray(compData.companies)) {
            compData.companies.slice(0, 4).forEach((c: any) => {
              newItems.push({
                id: `comp-${c.company}`,
                title: c.company,
                subtitle: `${c.count} Interview Questions`,
                category: 'Companies',
                href: `/company/${encodeURIComponent(c.company)}`,
              });
            });
          }
        }

        if (patRes.ok) {
          const patData = await patRes.json();
          if (Array.isArray(patData.patterns)) {
            patData.patterns.slice(0, 4).forEach((p: any) => {
              newItems.push({
                id: `pat-${p.slug}`,
                title: p.category,
                subtitle: `${p.count} Problems • ${p.group}`,
                category: 'Patterns',
                href: `/patterns/${p.slug}`,
              });
            });
          }
        }

        // Add matching actions
        const matchedActions = QUICK_ACTIONS.filter(
          (a) =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.subtitle?.toLowerCase().includes(query.toLowerCase())
        );

        setItems([...matchedActions, ...newItems]);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Command search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter' && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
          <Search size={18} className="text-[var(--accent-green)] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search companies, DSA patterns, or type an action..."
            className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-white mr-2">
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] mono bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[var(--border-subtle)]/30">
          {loading ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-2">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-[var(--accent-green)] border-t-transparent rounded-full" />
              <p>Searching LeetCamp catalog...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-1">
              <p className="text-[var(--text-secondary)] font-medium">No matches found for &quot;{query}&quot;</p>
              <p>Try searching for a company like &quot;Google&quot;, a pattern like &quot;Sliding Window&quot;, or &quot;Mock Interview&quot;</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-sm)] cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--bg-hover)] border-l-2 border-[var(--accent-green)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-raised)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 text-[var(--accent-green)]">
                      {item.category === 'Actions' && <Sparkles size={16} />}
                      {item.category === 'Companies' && <Building2 size={16} />}
                      {item.category === 'Patterns' && <Layers size={16} />}
                      {item.category === 'Problems' && <Target size={16} />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
                      {item.category}
                    </span>
                    <ArrowRight size={13} className={`transition-transform ${isSelected ? 'translate-x-0.5 text-[var(--accent-green)]' : 'opacity-0'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[var(--bg-surface-raised)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="mono">LeetCamp v3 Core</span>
        </div>
      </div>
    </div>
  );
}
