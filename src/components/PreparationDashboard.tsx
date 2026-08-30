'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  TrendingUp,
  Layers,
  Building2,
  Trash2
} from 'lucide-react';
import {
  PreparationPlan,
  getActivePreparationPlan,
  saveActivePreparationPlan,
  clearActivePreparationPlan,
  recordProblemOutcome,
  getUserStats
} from '@/lib/userProgress';
import { ProblemSolveModal } from './ProblemSolveModal';

const POPULAR_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Bloomberg', 'TCS', 'Infosys', 'Uber', 'Adobe'
];

const PREPARATION_GOALS = [
  { id: 'Company interview', title: 'Target Company Interview', desc: 'Laser-focused preparation for specific company rounds' },
  { id: 'General DSA preparation', title: 'General DSA Mastery', desc: 'Comprehensive pattern mastery across top standard problems' },
  { id: 'Coding assessment', title: 'Online Assessment (OA) Sprint', desc: 'High-frequency speed-run for upcoming hiring tests' },
  { id: 'Internship', title: 'Internship Preparation', desc: 'Fundamental to intermediate problem banks' },
];

const TIMELINE_OPTIONS = [
  { days: 7, label: '7 Days', subtitle: 'Emergency Sprint', icon: '⚡' },
  { days: 14, label: '14 Days', subtitle: 'Rapid Crash Course', icon: '🚀' },
  { days: 30, label: '30 Days', subtitle: 'Standard Interview Path', icon: '🎯' },
  { days: 60, label: '60 Days', subtitle: 'In-Depth Prep', icon: '📚' },
  { days: 90, label: '90 Days', subtitle: 'Mastery Bootcamp', icon: '🏆' },
];

export function PreparationDashboard() {
  const [activePlan, setActivePlan] = useState<PreparationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGoal, setSelectedGoal] = useState('Company interview');
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['Google']);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [dailyTarget, setDailyTarget] = useState(3);
  const [companySearch, setCompanySearch] = useState('');

  // Problem solve modal state
  const [solveModalProblem, setSolveModalProblem] = useState<any>(null);
  const [selectedDayView, setSelectedDayView] = useState(1);

  useEffect(() => {
    const plan = getActivePreparationPlan();
    if (plan) {
      setActivePlan(plan);
      setSelectedDayView(plan.currentDay || 1);
    }
  }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: selectedCompany,
          companies: selectedCompanies,
          goal: selectedGoal,
          duration: selectedDuration,
          level: selectedLevel,
          dailyTarget,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate plan');
      const data = await res.json();
      if (data.plan) {
        saveActivePreparationPlan(data.plan);
        setActivePlan(data.plan);
        setSelectedDayView(1);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleProblem = (problem: any, currentSolved: boolean) => {
    if (!currentSolved) {
      setSolveModalProblem({
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        company: activePlan?.company,
        url: problem.url,
      });
    } else {
      recordProblemOutcome(problem, 'unsolved');
      const updated = getActivePreparationPlan();
      setActivePlan(updated);
    }
  };

  const handleModalSuccess = () => {
    const updated = getActivePreparationPlan();
    setActivePlan(updated);
  };

  const handleResetPlan = () => {
    if (confirm('Are you sure you want to clear your current preparation plan and start over?')) {
      clearActivePreparationPlan();
      setActivePlan(null);
      setStep(1);
    }
  };

  const totalProblemsInPlan = activePlan?.days.reduce((acc, d) => acc + d.problems.length, 0) || 0;
  const solvedProblemsInPlan = activePlan?.days.reduce(
    (acc, d) => acc + d.problems.filter((p) => p.solved).length,
    0
  ) || 0;
  const planProgressPct = totalProblemsInPlan > 0 ? Math.round((solvedProblemsInPlan / totalProblemsInPlan) * 100) : 0;

  const currentDayData = activePlan?.days.find((d) => d.dayNumber === selectedDayView) || activePlan?.days[0];

  // -------------------------------------------------------------
  // RENDER: ONBOARDING WIZARD
  // -------------------------------------------------------------
  if (!activePlan) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Wizard Hero Header */}
        <div className="data-surface p-6 sm:p-8 space-y-3 text-center border-b border-[var(--border-subtle)]">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 mx-auto flex items-center justify-center">
            <Target size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Build Your Personalized Preparation Plan
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Tell LeetCamp your target company, interview timeline, and level. We will build a structured daily mission roadmap so you always know what to solve next.
          </p>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s
                    ? 'w-8 bg-[var(--accent-green)]'
                    : step > s
                    ? 'w-5 bg-[var(--border-strong)]'
                    : 'w-3 bg-[var(--bg-surface-raised)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Goal */}
        {step === 1 && (
          <div className="data-surface p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="label-caps block mb-1">Step 1 of 4</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">What are you preparing for?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PREPARATION_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-4 text-left rounded-[var(--radius-md)] border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-[var(--accent-green)] bg-[var(--bg-hover)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{goal.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{goal.desc}</p>
                    </div>
                    <span className={`chip w-fit ${isSelected ? 'bg-[var(--accent-green)] text-[#0e0f12] font-semibold' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'}`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setStep(2)}
                className="btn-primary py-2 px-5 text-sm"
              >
                <span>Continue to Target Company</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Company Selection */}
        {step === 2 && (
          <div className="data-surface p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="label-caps block mb-1">Step 2 of 4</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Choose your target company</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Select your primary target organization to align problem frequencies and recent interview questions.
              </p>
            </div>

            {/* Quick Picks */}
            <div className="space-y-2">
              <span className="label-caps block">Popular Quick Picks</span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_COMPANIES.map((comp) => {
                  const isSelected = selectedCompany === comp;
                  return (
                    <button
                      key={comp}
                      onClick={() => {
                        setSelectedCompany(comp);
                        setSelectedCompanies([comp]);
                      }}
                      className={`px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-[var(--accent-green)] text-[#0e0f12] border-[var(--accent-green)] shadow-sm'
                          : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom search */}
            <div className="space-y-2 pt-2">
              <span className="label-caps block">Or Type Company Name</span>
              <input
                type="text"
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedCompany(e.target.value.trim());
                    setSelectedCompanies([e.target.value.trim()]);
                  }
                }}
                placeholder="e.g. Netflix, Goldman Sachs, TCS, Infosys..."
                className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] focus:border-[var(--accent-green)] text-[var(--text-primary)] px-3.5 py-2 rounded-[var(--radius-sm)] text-sm outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[var(--text-secondary)] hover:text-white font-medium"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary py-2 px-5 text-sm"
              >
                <span>Continue to Timeline</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Timeline Selection */}
        {step === 3 && (
          <div className="data-surface p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="label-caps block mb-1">Step 3 of 4</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">When is your interview?</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Choose your preparation timeframe to calibrate daily problem density.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {TIMELINE_OPTIONS.map((opt) => {
                const isSelected = selectedDuration === opt.days;
                return (
                  <button
                    key={opt.days}
                    onClick={() => setSelectedDuration(opt.days)}
                    className={`p-4 text-center rounded-[var(--radius-md)] border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-[var(--accent-green)] bg-[var(--bg-hover)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{opt.label}</h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{opt.subtitle}</p>
                    </div>
                    <span className={`chip mx-auto ${isSelected ? 'bg-[var(--accent-green)] text-[#0e0f12]' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'}`}>
                      {isSelected ? 'Active' : 'Choose'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[var(--text-secondary)] hover:text-white font-medium"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-primary py-2 px-5 text-sm"
              >
                <span>Continue to Level</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Experience Level & Daily Target */}
        {step === 4 && (
          <div className="data-surface p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="label-caps block mb-1">Step 4 of 4</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">What is your current level?</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                We balance the ratio of Easy, Medium, and Hard problems according to your familiarity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: 'Beginner', title: 'Beginner', desc: 'Still learning core patterns, prefer Easy & standard Mediums' },
                { id: 'Intermediate', title: 'Intermediate', desc: 'Comfortable with standard Easy/Mediums, ready for interview classics' },
                { id: 'Advanced', title: 'Advanced', desc: 'Comfortable with Hard/Competitive programming questions' },
              ].map((lvl) => {
                const isSelected = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id as any)}
                    className={`p-4 text-left rounded-[var(--radius-md)] border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-[var(--accent-green)] bg-[var(--bg-hover)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{lvl.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{lvl.desc}</p>
                    </div>
                    <span className={`chip w-fit ${isSelected ? 'bg-[var(--accent-green)] text-[#0e0f12]' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'}`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Daily problem pace */}
            <div className="space-y-2 pt-2">
              <span className="label-caps block">How many problems can you solve per day?</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((target) => (
                  <button
                    key={target}
                    onClick={() => setDailyTarget(target)}
                    className={`flex-1 py-2 rounded-[var(--radius-sm)] text-xs mono font-bold border transition-all ${
                      dailyTarget === target
                        ? 'bg-[var(--accent-green)] text-[#0e0f12] border-[var(--accent-green)]'
                        : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {target} / day
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setStep(3)}
                className="text-xs text-[var(--text-secondary)] hover:text-white font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Analyzing Company Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate My Preparation Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ACTIVE PREPARATION PLAN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Plan Header Card */}
      <div className="data-surface p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip bg-[var(--accent-green-dim)] text-[var(--accent-green)] border border-[var(--accent-green)]/30 font-medium">
                Active Roadmap
              </span>
              <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)] mono">
                {activePlan.level} Level
              </span>
              <span className="chip bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)] mono">
                ~{activePlan.dailyTarget} Qs/Day
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-2">
              {activePlan.company} {activePlan.durationDays}-Day Preparation Plan
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Personalized schedule covering {totalProblemsInPlan} high-probability questions structured by DSA patterns
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/company/${encodeURIComponent(activePlan.company)}`}
              className="btn-primary py-1.5 px-3 text-xs"
            >
              <Building2 size={13} />
              <span>Full Company Bank</span>
            </Link>
            <button
              onClick={handleResetPlan}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--diff-hard)] hover:bg-[var(--bg-hover)] rounded"
              title="Reset plan"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar & Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Roadmap Completion</span>
              <span className="mono font-bold text-[var(--accent-green)]">{planProgressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-[var(--bg-surface-raised)]">
              <div
                style={{ width: `${planProgressPct}%` }}
                className="bg-[var(--accent-green)] h-full transition-all duration-300"
              />
            </div>
            <span className="text-[11px] text-[var(--text-muted)] mono">
              {solvedProblemsInPlan} of {totalProblemsInPlan} problems solved
            </span>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] sm:pl-4">
            <span className="label-caps block">Target Company</span>
            <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>{activePlan.company}</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              Goal: {activePlan.goal}
            </span>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[var(--border-subtle)] sm:pl-4">
            <span className="label-caps block">Schedule Pace</span>
            <div className="text-sm font-bold text-[var(--text-primary)] mono">
              Day {selectedDayView} of {activePlan.durationDays}
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              Est. time: ~{activePlan.dailyTarget * 25} mins / day
            </span>
          </div>
        </div>
      </div>

      {/* TODAY'S MISSION CARD */}
      {currentDayData && (
        <div className="data-surface p-5 sm:p-6 space-y-4 border-l-4 border-l-[var(--accent-green)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--accent-green-dim)] text-[var(--accent-green)] flex items-center justify-center font-bold mono">
                {currentDayData.dayNumber}
              </div>
              <div>
                <span className="label-caps block text-[var(--accent-green)]">Day {currentDayData.dayNumber} Mission</span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {currentDayData.focusPattern || currentDayData.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="chip bg-[var(--bg-surface-raised)] text-[var(--text-muted)] mono text-xs">
                {currentDayData.problems.filter((p) => p.solved).length} / {currentDayData.problems.length} Complete
              </span>
            </div>
          </div>

          {/* Daily Problem List */}
          <div className="space-y-2.5">
            {currentDayData.problems.map((prob, idx) => {
              const isSolved = !!prob.solved;
              return (
                <div
                  key={prob.slug}
                  className={`p-3.5 rounded-[var(--radius-md)] border transition-all flex items-center justify-between gap-4 ${
                    isSolved
                      ? 'bg-[var(--bg-surface-raised)]/60 border-[var(--border-subtle)] opacity-75'
                      : 'bg-[var(--bg-surface-raised)] border-[var(--border-strong)] hover:border-[var(--accent-green)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleProblem(prob, isSolved)}
                      className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent-green)] transition-colors"
                    >
                      {isSolved ? (
                        <CheckCircle2 size={20} className="text-[var(--accent-green)]" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${isSolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                          #{idx + 1} {prob.title}
                        </span>
                        <span className={`chip ${prob.difficulty === 'Easy' ? 'chip-easy' : prob.difficulty === 'Medium' ? 'chip-medium' : 'chip-hard'}`}>
                          {prob.difficulty}
                        </span>
                        {prob.frequency && (
                          <span className="chip bg-[var(--bg-base)] text-[var(--accent-green)] text-[10px] mono">
                            {prob.frequency.toFixed(0)}% freq
                          </span>
                        )}
                      </div>
                      {prob.topics && (
                        <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 truncate">
                          {prob.topics}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={prob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-1 px-2.5 text-xs text-[var(--accent-green)]"
                    >
                      <span>Solve</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Schedule Timeline Navigator */}
      <div className="data-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={17} className="text-[var(--accent-green)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Complete {activePlan.durationDays}-Day Preparation Roadmap
            </h3>
          </div>
          <span className="text-xs text-[var(--text-muted)] mono">
            {activePlan.days.length} Daily Sessions
          </span>
        </div>

        {/* Horizontal Day Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activePlan.days.map((day) => {
            const isSelected = selectedDayView === day.dayNumber;
            const isAllSolved = day.problems.every((p) => p.solved);
            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayView(day.dayNumber)}
                className={`px-3 py-2 rounded-[var(--radius-sm)] text-xs shrink-0 transition-all flex flex-col items-center gap-1 border ${
                  isSelected
                    ? 'bg-[var(--accent-green)] text-[#0e0f12] font-bold border-[var(--accent-green)]'
                    : isAllSolved
                    ? 'bg-[var(--bg-surface-raised)] text-[var(--accent-green)] border-[var(--accent-green)]/40'
                    : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white'
                }`}
              >
                <span className="mono">Day {day.dayNumber}</span>
                {isAllSolved && <CheckCircle2 size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Solve Result Outcome Modal */}
      {solveModalProblem && (
        <ProblemSolveModal
          isOpen={!!solveModalProblem}
          onClose={() => setSolveModalProblem(null)}
          problem={solveModalProblem}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
