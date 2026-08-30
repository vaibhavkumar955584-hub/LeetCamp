'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Flame,
  Award,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Target,
  ExternalLink
} from 'lucide-react';
import {
  getUserStats,
  getProblemAttempts,
  getWeakAreasAnalysis,
  UserStats,
  ProblemAttempt,
  PatternPerformance
} from '@/lib/userProgress';

export function ProgressDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [attempts, setAttempts] = useState<ProblemAttempt[]>([]);
  const [weakAreas, setWeakAreas] = useState<PatternPerformance[]>([]);

  useEffect(() => {
    try {
      setStats(getUserStats());
      const atts = Object.values(getProblemAttempts()).sort((a, b) => b.timestamp - a.timestamp);
      setAttempts(atts);
      setWeakAreas(getWeakAreasAnalysis());
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  }, []);

  const totalSolved = stats?.solvedCount || 0;
  const totalMastered = stats?.masteredCount || 0;
  const totalAttempted = stats?.attemptedCount || 0;
  const streak = stats?.streakDays || 1;
  const xp = stats?.totalXp || 0;

  const easySolved = attempts.filter((a) => a.difficulty === 'Easy' && (a.status === 'solved' || a.status === 'mastered')).length;
  const medSolved = attempts.filter((a) => a.difficulty === 'Medium' && (a.status === 'solved' || a.status === 'mastered')).length;
  const hardSolved = attempts.filter((a) => a.difficulty === 'Hard' && (a.status === 'solved' || a.status === 'mastered')).length;

  const milestones = [
    { title: 'First 10 Problems', desc: 'Solve your first 10 interview questions', achieved: totalSolved >= 10, icon: '🎯' },
    { title: '7-Day Streak', desc: 'Practice consecutively for 7 days', achieved: streak >= 7, icon: '🔥' },
    { title: 'First Hard Question', desc: 'Master your first Hard-difficulty interview problem', achieved: hardSolved >= 1, icon: '🏆' },
    { title: 'DSA Apprentice', desc: 'Earn 250+ XP across practice sessions', achieved: xp >= 250, icon: '⚡' },
    { title: 'Interview Ready (50+ Solved)', desc: 'Complete 50 unique interview problems', achieved: totalSolved >= 50, icon: '🚀' },
  ];

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="data-surface p-5 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-medium">
            Personal Intelligence & Analytics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Preparation Progress & Weak Areas
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Real-time metrics tracking your solve rates, difficulty performance, weak patterns, and preparation milestones.
        </p>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <div className="data-surface p-3.5 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">
            <span className="label-caps block text-[var(--accent-green)]">Problems Solved</span>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">{totalSolved}</div>
            <span className="text-[11px] text-[var(--text-muted)]">{totalMastered} Mastered</span>
          </div>

          <div className="data-surface p-3.5 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">
            <span className="label-caps block text-[#f59e0b]">Active Streak</span>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1 flex items-center gap-1">
              <span>{streak}</span>
              <span className="text-sm">Days</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Keep daily momentum</span>
          </div>

          <div className="data-surface p-3.5 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">
            <span className="label-caps block text-[#3b82f6]">Total XP</span>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">{xp} XP</div>
            <span className="text-[11px] text-[var(--text-muted)]">Level {Math.floor(xp / 100) + 1} Candidate</span>
          </div>

          <div className="data-surface p-3.5 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">
            <span className="label-caps block text-[#a855f7]">Attempts Logged</span>
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">{totalAttempted}</div>
            <span className="text-[11px] text-[var(--text-muted)]">Recorded outcomes</span>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown & Weak Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Difficulty Breakdown */}
        <div className="lg:col-span-5 data-surface p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span className="label-caps block">Difficulty Performance</span>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Solved by Tier</h2>
            </div>
            <span className="mono text-xs text-[var(--text-muted)]">{totalSolved} Total</span>
          </div>

          <div className="space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--diff-easy)] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--diff-easy)]" />
                  Easy Problems
                </span>
                <span className="mono font-bold text-[var(--text-primary)]">{easySolved}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-surface-raised)]">
                <div
                  style={{ width: `${Math.min(100, (easySolved / Math.max(1, totalSolved)) * 100)}%` }}
                  className="bg-[var(--diff-easy)] h-full"
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--diff-medium)] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--diff-medium)]" />
                  Medium Problems
                </span>
                <span className="mono font-bold text-[var(--text-primary)]">{medSolved}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-surface-raised)]">
                <div
                  style={{ width: `${Math.min(100, (medSolved / Math.max(1, totalSolved)) * 100)}%` }}
                  className="bg-[var(--diff-medium)] h-full"
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--diff-hard)] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--diff-hard)]" />
                  Hard Problems
                </span>
                <span className="mono font-bold text-[var(--text-primary)]">{hardSolved}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-surface-raised)]">
                <div
                  style={{ width: `${Math.min(100, (hardSolved / Math.max(1, totalSolved)) * 100)}%` }}
                  className="bg-[var(--diff-hard)] h-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <Link
              href="/prepare"
              className="btn-primary w-full justify-center text-xs py-2"
            >
              <span>Build New Preparation Roadmap</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Weak Areas Analyzer */}
        <div className="lg:col-span-7 data-surface p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span className="label-caps block text-[var(--diff-hard)]">Remediation Engine</span>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Weakest DSA Patterns</h2>
            </div>
            <Link
              href="/practice?mode=weak"
              className="btn-primary py-1 px-2.5 text-xs text-[var(--accent-green)]"
            >
              <span>Practice Weak Areas</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {weakAreas.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-2">
              <Sparkles size={20} className="text-[var(--accent-green)] mx-auto" />
              <p className="text-[var(--text-primary)] font-semibold">No weakness alerts yet</p>
              <p>As you log problem attempts with hints or failed attempts, LeetCamp will pinpoint your weak areas here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakAreas.slice(0, 4).map((w) => (
                <div
                  key={w.pattern}
                  className="p-3.5 bg-[var(--bg-surface-raised)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {w.pattern}
                      </span>
                      <span className={`chip ${w.level === 'critical' ? 'chip-hard' : w.level === 'moderate' ? 'chip-medium' : 'chip-easy'}`}>
                        {w.successRate}% Success
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                      {w.solved}/{w.totalAttempted} solved independently ({w.hintOrSolutionNeeded} needed assistance)
                    </span>
                  </div>

                  <Link
                    href={`/patterns?search=${encodeURIComponent(w.pattern)}`}
                    className="btn-primary py-1 px-2.5 text-xs shrink-0"
                  >
                    Drill Pattern
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preparation Milestones */}
      <div className="data-surface p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <span className="label-caps block">Achievements</span>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Preparation Milestones</h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] mono">
            {milestones.filter((m) => m.achieved).length} of {milestones.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {milestones.map((m) => (
            <div
              key={m.title}
              className={`p-4 rounded-[var(--radius-md)] border flex flex-col justify-between gap-3 transition-all ${
                m.achieved
                  ? 'bg-[var(--bg-hover)] border-[var(--accent-green)]/40 shadow-sm'
                  : 'bg-[var(--bg-surface-raised)] border-[var(--border-subtle)] opacity-50'
              }`}
            >
              <div>
                <div className="text-2xl mb-1">{m.icon}</div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">{m.title}</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.desc}</p>
              </div>
              <span className={`chip w-fit text-[10px] ${m.achieved ? 'bg-[var(--accent-green-dim)] text-[var(--accent-green)] font-semibold' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'}`}>
                {m.achieved ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Attempt History Log */}
      {attempts.length > 0 && (
        <div className="data-surface p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div>
              <span className="label-caps block">Audit Log</span>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Recent Practice History</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] mono">{attempts.length} Total Logs</span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {attempts.slice(0, 10).map((a) => (
              <div
                key={`${a.slug}-${a.timestamp}`}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--bg-hover)] transition-colors px-2 rounded"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{a.title}</span>
                    <span className={`chip ${a.difficulty === 'Easy' ? 'chip-easy' : a.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                      {a.difficulty}
                    </span>
                    <span className="chip bg-[var(--bg-surface-raised)] text-[var(--text-muted)] text-[10px]">
                      {a.status === 'mastered'
                        ? '★ Mastered'
                        : a.status === 'solved'
                        ? '✓ Solved'
                        : a.status === 'hint_used'
                        ? '💡 Hint Used'
                        : a.status === 'solution_needed'
                        ? '📖 Solution Needed'
                        : '◷ Attempted'}
                    </span>
                  </div>
                  {a.company && (
                    <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                      Target: {a.company} • +{a.xpEarned} XP
                    </span>
                  )}
                </div>

                <span className="text-xs text-[var(--text-muted)] mono shrink-0">
                  {new Date(a.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
