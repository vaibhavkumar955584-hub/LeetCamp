'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  BookOpen,
  XCircle,
  Award,
  Sparkles,
  ExternalLink,
  Clock,
  X
} from 'lucide-react';
import { SolveStatus, recordProblemOutcome } from '@/lib/userProgress';

interface ProblemSolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: {
    id: number | string;
    title: string;
    slug: string;
    difficulty: string;
    company?: string;
    category?: string;
    url?: string;
  };
  onSuccess?: () => void;
}

export function ProblemSolveModal({ isOpen, onClose, problem, onSuccess }: ProblemSolveModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<SolveStatus>('solved');
  const [timeSpent, setTimeSpent] = useState<number>(20);
  const [notes, setNotes] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (status: SolveStatus) => {
    setSelectedStatus(status);
    const attempt = recordProblemOutcome(problem, status, timeSpent, notes);
    setEarnedXp(attempt.xpEarned);
    setJustSubmitted(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      setJustSubmitted(false);
      onClose();
    }, 1200);
  };

  const outcomeOptions: Array<{
    status: SolveStatus;
    title: string;
    subtitle: string;
    icon: any;
    xp: string;
    color: string;
  }> = [
    {
      status: 'mastered',
      title: 'Mastered',
      subtitle: 'Solved effortlessly without any hints with optimal O(n) runtime',
      icon: Award,
      xp: '+50 XP',
      color: 'border-[#3b82f6] text-[#60a5fa] hover:bg-[#3b82f6]/10',
    },
    {
      status: 'solved',
      title: 'Solved Independently',
      subtitle: 'Came up with working solution & passed all test cases',
      icon: CheckCircle2,
      xp: '+25 XP',
      color: 'border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10',
    },
    {
      status: 'hint_used',
      title: 'Solved with Hint',
      subtitle: 'Looked at discussion/hint to unblock key insight',
      icon: HelpCircle,
      xp: '+15 XP',
      color: 'border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10',
    },
    {
      status: 'solution_needed',
      title: 'Needed Solution',
      subtitle: 'Read editorial/code walkthrough to understand pattern',
      icon: BookOpen,
      xp: '+10 XP',
      color: 'border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/10',
    },
    {
      status: 'attempted',
      title: "Couldn't Solve / Attempted",
      subtitle: 'Spent time on problem, will revisit later',
      icon: XCircle,
      xp: '+5 XP',
      color: 'border-[var(--border-strong)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`chip ${problem.difficulty === 'Easy' ? 'chip-easy' : problem.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                {problem.difficulty}
              </span>
              {problem.company && (
                <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {problem.company}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {problem.title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              How did your practice attempt go? Log your result to refine your weakness analytics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white p-1 rounded hover:bg-[var(--bg-hover)]"
          >
            <X size={16} />
          </button>
        </div>

        {justSubmitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 mx-auto flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Result Recorded! {earnedXp > 0 && <span className="text-[var(--accent-green)] font-mono">+{earnedXp} XP</span>}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Your preparation plan and weakness metrics have been updated.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Outcome choices */}
            <div className="space-y-2">
              <span className="label-caps block">Select Attempt Outcome</span>
              <div className="space-y-2">
                {outcomeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.status}
                      onClick={() => handleSubmit(opt.status)}
                      className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-all flex items-center justify-between gap-3 bg-[var(--bg-surface-raised)] ${opt.color}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon size={18} className="mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {opt.subtitle}
                          </div>
                        </div>
                      </div>
                      <span className="chip font-mono text-[10px] font-semibold bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                        {opt.xp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time spent */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[var(--text-muted)]" />
                <span>Time spent:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[10, 20, 35, 50].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTimeSpent(mins)}
                    className={`px-2 py-1 rounded text-[11px] mono border transition-colors ${
                      timeSpent === mins
                        ? 'bg-[var(--accent-green)] text-[#0e0f12] font-bold border-[var(--accent-green)]'
                        : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Problem solve link */}
            {problem.url && (
              <div className="text-center pt-2">
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-green)] hover:underline"
                >
                  <span>Open problem on external platform</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
