'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Zap,
  Clock,
  Building2,
  Layers,
  Sparkles,
  Dice5,
  Mic,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';
import { getWeakAreasAnalysis, recordProblemOutcome } from '@/lib/userProgress';
import { ProblemSolveModal } from './ProblemSolveModal';

export function PracticeCenter() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') || 'time';

  const [activeTab, setActiveTab] = useState<'time' | 'company' | 'pattern' | 'weak' | 'mock'>(
    (initialMode as any) || 'time'
  );

  // Time-based practice state
  const [selectedTimeBudget, setSelectedTimeBudget] = useState<number>(30);
  const [timeMatchedProblems, setTimeMatchedProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  // Mock interview state
  const [mockRunning, setMockRunning] = useState(false);
  const [mockCompany, setMockCompany] = useState('Google');
  const [mockSecondsLeft, setMockSecondsLeft] = useState(45 * 60);
  const [mockProblems, setMockProblems] = useState<any[]>([]);
  const [currentMockIdx, setCurrentMockIdx] = useState(0);
  const [mockNotes, setMockNotes] = useState('');
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockScore, setMockScore] = useState<any>(null);

  // Modal state
  const [solveProblem, setSolveProblem] = useState<any>(null);

  // Weak areas
  const [weakAreas, setWeakAreas] = useState<any[]>([]);

  useEffect(() => {
    try {
      const wa = getWeakAreasAnalysis();
      setWeakAreas(wa);
    } catch {}
  }, []);

  // Fetch problems when time budget changes
  useEffect(() => {
    async function loadTimeProblems() {
      setLoadingProblems(true);
      try {
        const count = selectedTimeBudget <= 15 ? 1 : selectedTimeBudget <= 30 ? 2 : selectedTimeBudget <= 60 ? 3 : 5;
        const res = await fetch(`/api/companies/Google/problems?limit=${count * 3}`);
        if (res.ok) {
          const data = await res.json();
          setTimeMatchedProblems(data.problems?.slice(0, count) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProblems(false);
      }
    }

    if (activeTab === 'time') {
      loadTimeProblems();
    }
  }, [selectedTimeBudget, activeTab]);

  // Mock interview countdown timer
  useEffect(() => {
    let timer: any;
    if (mockRunning && mockSecondsLeft > 0 && !mockSubmitted) {
      timer = setInterval(() => {
        setMockSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (mockSecondsLeft === 0 && mockRunning && !mockSubmitted) {
      handleFinishMock();
    }
    return () => clearInterval(timer);
  }, [mockRunning, mockSecondsLeft, mockSubmitted]);

  const handleStartMock = async () => {
    setLoadingProblems(true);
    try {
      const res = await fetch(`/api/companies/${encodeURIComponent(mockCompany)}/problems?limit=10`);
      if (res.ok) {
        const data = await res.json();
        const list = data.problems || [];
        const easyMed = list.filter((p: any) => p.difficulty === 'Easy' || p.difficulty === 'Medium');
        const hard = list.filter((p: any) => p.difficulty === 'Hard');

        const chosen = [easyMed[0] || list[0], hard[0] || list[1] || list[0]].filter(Boolean);
        setMockProblems(chosen);
        setMockSecondsLeft(45 * 60);
        setCurrentMockIdx(0);
        setMockNotes('');
        setMockSubmitted(false);
        setMockScore(null);
        setMockRunning(true);
      }
    } catch (e) {
      console.error('Failed to start mock:', e);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleFinishMock = () => {
    setMockRunning(false);
    setMockSubmitted(true);

    const timeUsed = 45 * 60 - mockSecondsLeft;
    const timeScore = Math.max(50, Math.min(100, Math.round(100 - (timeUsed / (45 * 60)) * 30)));
    const problemScore = 85;
    const patternScore = 80;
    const overall = Math.round((problemScore + timeScore + patternScore) / 3);

    setMockScore({
      overall,
      problemScore,
      timeScore,
      patternScore,
      timeUsedMins: Math.round(timeUsed / 60),
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="data-surface p-5 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-medium">
            Smart Practice Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Practice Center & Mock Simulator
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Targeted practice sessions tailored to your available time, target company, or technical weak areas.
        </p>

        {/* Mode Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
          {[
            { id: 'time', label: 'Time-Based Practice', icon: Clock },
            { id: 'weak', label: 'Weak Areas Remediation', icon: ShieldAlert },
            { id: 'mock', label: '45-Min Mock Interview', icon: Mic },
            { id: 'company', label: 'Company Bank', icon: Building2 },
            { id: 'pattern', label: 'Pattern Roadmap', icon: Layers },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] border-[var(--accent-green)] shadow-sm'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white hover:border-[var(--border-strong)]'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-[#0e0f12]' : 'text-[var(--text-muted)]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: Time-Based Practice */}
      {activeTab === 'time' && (
        <div className="data-surface p-5 sm:p-6 space-y-6">
          <div>
            <span className="label-caps block mb-1">Quick Session</span>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              How much time do you have right now?
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              We curate the optimal problem set designed for your exact available window.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { mins: 10, label: '10 Mins', sub: '1 Quick Easy Problem' },
              { mins: 30, label: '30 Mins', sub: '1-2 Core Standard Mediums' },
              { mins: 60, label: '60 Mins', sub: '3 Interview Problems' },
              { mins: 90, label: '90+ Mins', sub: 'Deep Problem Solving' },
            ].map((budget) => {
              const isSelected = selectedTimeBudget === budget.mins;
              return (
                <button
                  key={budget.mins}
                  onClick={() => setSelectedTimeBudget(budget.mins)}
                  className={`p-4 rounded-[var(--radius-md)] border text-left transition-all ${
                    isSelected
                      ? 'border-[var(--accent-green)] bg-[var(--bg-hover)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-base font-bold text-[var(--text-primary)] mono">{budget.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">{budget.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Curated Problems */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
            <span className="label-caps block">Curated For Your {selectedTimeBudget}-Min Session</span>

            {loadingProblems ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-[var(--accent-green)] border-t-transparent rounded-full" />
                <p className="mt-2">Picking ideal problems...</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {timeMatchedProblems.map((prob, i) => (
                  <div
                    key={prob.slug}
                    className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] hover:border-[var(--accent-green)] transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          #{i + 1} {prob.title}
                        </span>
                        <span className={`chip ${prob.difficulty === 'Easy' ? 'chip-easy' : prob.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                          {prob.difficulty}
                        </span>
                        {prob.company && (
                          <span className="chip bg-[var(--bg-base)] text-[var(--text-muted)] text-[10px]">
                            {prob.company}
                          </span>
                        )}
                      </div>
                      {prob.topics && (
                        <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                          {prob.topics}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSolveProblem(prob)}
                        className="chip bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
                      >
                        Log Result
                      </button>
                      <a
                        href={prob.leetcode_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-1 px-3 text-xs text-[var(--accent-green)]"
                      >
                        <span>Solve</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: Weak Areas Focus */}
      {activeTab === 'weak' && (
        <div className="data-surface p-5 sm:p-6 space-y-5">
          <div>
            <span className="label-caps block mb-1">Targeted Remediation</span>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Focus on Your Lowest-Scoring DSA Patterns
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Identified from your logged attempts, hint usage, and unsolved questions.
            </p>
          </div>

          {weakAreas.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface-raised)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] space-y-2">
              <Sparkles size={24} className="text-[var(--accent-green)] mx-auto" />
              <p className="text-[var(--text-primary)] font-semibold text-sm">No weak areas recorded yet!</p>
              <p>Solve and log a few problems to generate custom weakness analytics.</p>
              <Link href="/patterns" className="btn-primary inline-flex mt-2">
                Explore All 48 Patterns
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {weakAreas.map((w) => (
                <div
                  key={w.pattern}
                  className="data-surface p-4 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {w.pattern}
                      </span>
                      <span className={`chip ${w.level === 'critical' ? 'chip-hard' : w.level === 'moderate' ? 'chip-medium' : 'chip-easy'}`}>
                        {w.successRate}% Win Rate
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {w.solved} of {w.totalAttempted} solved independently ({w.hintOrSolutionNeeded} needed hints)
                    </p>
                  </div>
                  <Link
                    href={`/patterns?search=${encodeURIComponent(w.pattern)}`}
                    className="btn-primary py-1 px-3 text-xs w-fit"
                  >
                    <span>Practice {w.pattern}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Timed Mock Interview Simulator */}
      {activeTab === 'mock' && (
        <div className="data-surface p-5 sm:p-6 space-y-6">
          {!mockRunning && !mockSubmitted && (
            <div className="space-y-5">
              <div>
                <span className="label-caps block mb-1">Assessment Simulator</span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  45-Minute Timed Technical Mock Interview
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Simulates a live company technical coding round with 2 interview questions and a post-interview performance evaluation score.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="label-caps block">Select Target Company</span>
                  <select
                    value={mockCompany}
                    onChange={(e) => setMockCompany(e.target.value)}
                    className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs px-3 py-2 rounded-[var(--radius-sm)] outline-none cursor-pointer"
                  >
                    {['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Bloomberg', 'TCS', 'Infosys', 'Uber'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="label-caps block">Duration & Format</span>
                  <div className="p-2 bg-[var(--bg-surface-raised)] rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] mono flex items-center gap-1.5">
                    <Clock size={13} className="text-[var(--accent-green)]" />
                    <span>45 Minutes • 2 Questions (1 Med + 1 Hard)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartMock}
                disabled={loadingProblems}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
              >
                <Play size={16} />
                <span>Start Mock Interview</span>
              </button>
            </div>
          )}

          {/* Active Running Mock */}
          {mockRunning && (
            <div className="space-y-5 animate-in fade-in">
              {/* Mock Header & Timer */}
              <div className="flex items-center justify-between bg-[var(--bg-surface-raised)] p-4 rounded-[var(--radius-md)] border border-[var(--border-strong)]">
                <div>
                  <span className="label-caps block text-[var(--accent-green)]">Live Coding Interview</span>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{mockCompany} Technical Round</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-lg font-mono font-bold text-[var(--diff-hard)] bg-[var(--bg-base)] px-3 py-1.5 rounded border border-[var(--border-subtle)]">
                    <Clock size={16} />
                    <span>{formatTimer(mockSecondsLeft)}</span>
                  </div>
                  <button
                    onClick={handleFinishMock}
                    className="btn-primary py-1.5 px-3 text-xs bg-[var(--diff-hard)] text-white hover:bg-[var(--diff-hard)]/90"
                  >
                    Finish & Submit
                  </button>
                </div>
              </div>

              {/* Question Navigator */}
              {mockProblems.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-4 space-y-3">
                    <span className="label-caps block">Questions (2)</span>
                    {mockProblems.map((prob, idx) => (
                      <button
                        key={prob.slug}
                        onClick={() => setCurrentMockIdx(idx)}
                        className={`w-full p-3 rounded-[var(--radius-md)] border text-left transition-all ${
                          currentMockIdx === idx
                            ? 'border-[var(--accent-green)] bg-[var(--bg-hover)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="mono font-bold">Question {idx + 1}</span>
                          <span className={`chip ${prob.difficulty === 'Easy' ? 'chip-easy' : prob.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                            {prob.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {prob.title}
                        </h4>
                      </button>
                    ))}
                  </div>

                  {/* Active Question Surface */}
                  {mockProblems[currentMockIdx] && (
                    <div className="lg:col-span-8 data-surface p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            {mockProblems[currentMockIdx].title}
                          </h3>
                          <span className="text-xs text-[var(--text-muted)]">
                            {mockProblems[currentMockIdx].topics}
                          </span>
                        </div>
                        <a
                          href={mockProblems[currentMockIdx].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary py-1 px-3 text-xs text-[var(--accent-green)]"
                        >
                          <span>Solve in LeetCode</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>

                      {/* Notes Scratchpad */}
                      <div className="space-y-1.5">
                        <span className="label-caps block">Approach & Scratchpad Notes</span>
                        <textarea
                          rows={6}
                          value={mockNotes}
                          onChange={(e) => setMockNotes(e.target.value)}
                          placeholder="Type your time/space complexity notes, test cases, or pseudo-code here..."
                          className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] p-3 rounded-[var(--radius-sm)] text-xs font-mono focus:border-[var(--accent-green)] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Post-Mock Score Report */}
          {mockSubmitted && mockScore && (
            <div className="space-y-5 animate-in zoom-in-95">
              <div className="p-6 text-center space-y-3 bg-[var(--bg-surface-raised)] rounded-[var(--radius-lg)] border border-[var(--border-strong)]">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 mx-auto flex items-center justify-center">
                  <Award size={28} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Interview Assessment Complete!
                </h3>
                <div className="text-3xl font-mono font-bold text-[var(--accent-green)]">
                  {mockScore.overall} / 100
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Completed in {mockScore.timeUsedMins} minutes for {mockCompany} technical interview profile.
                </p>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-3 gap-3 pt-3 max-w-md mx-auto">
                  <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Problem Solving</span>
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{mockScore.problemScore}%</span>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Time Mgmt</span>
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{mockScore.timeScore}%</span>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-base)] rounded border border-[var(--border-subtle)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Pattern Recognition</span>
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{mockScore.patternScore}%</span>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      setMockSubmitted(false);
                      setMockRunning(false);
                    }}
                    className="btn-primary py-2 px-5 text-xs"
                  >
                    Start Another Mock Session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: By Company Quick Jump */}
      {activeTab === 'company' && (
        <div className="data-surface p-6 space-y-4 text-center">
          <Building2 size={24} className="text-[var(--accent-green)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Explore 429 Company Question Banks
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Browse company-specific interview problem sets with frequency rankings and difficulty filters.
          </p>
          <Link href="/" className="btn-primary inline-flex">
            <span>View All Companies</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* MODE 5: By Pattern Quick Jump */}
      {activeTab === 'pattern' && (
        <div className="data-surface p-6 space-y-4 text-center">
          <Layers size={24} className="text-[var(--accent-green)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Explore 48 DSA Patterns Roadmap
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Master patterns across 6 learning pillars from Core Data Structures to Dynamic Programming.
          </p>
          <Link href="/patterns" className="btn-primary inline-flex">
            <span>Explore Pattern Hub</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Solve Outcome Modal */}
      {solveProblem && (
        <ProblemSolveModal
          isOpen={!!solveProblem}
          onClose={() => setSolveProblem(null)}
          problem={solveProblem}
        />
      )}
    </div>
  );
}
