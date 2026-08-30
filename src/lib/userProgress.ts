'use client';

export type SolveStatus = 'unsolved' | 'attempted' | 'hint_used' | 'solution_needed' | 'solved' | 'mastered';

export interface ProblemAttempt {
  problemId: string | number;
  slug: string;
  title: string;
  difficulty: string;
  company?: string;
  category?: string;
  status: SolveStatus;
  notes?: string;
  timeSpentMinutes?: number;
  xpEarned: number;
  timestamp: number;
}

export interface PreparationPlan {
  id: string;
  goal: string;
  company: string;
  companies?: string[];
  durationDays: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  dailyTarget: number;
  createdAt: number;
  currentDay: number;
  days: Array<{
    dayNumber: number;
    title: string;
    focusPattern?: string;
    problems: Array<{
      id: number;
      title: string;
      slug: string;
      difficulty: string;
      frequency?: number;
      url: string;
      topics?: string;
      solved?: boolean;
    }>;
  }>;
}

export interface UserStats {
  solvedCount: number;
  masteredCount: number;
  attemptedCount: number;
  streakDays: number;
  lastActiveDate: string;
  totalXp: number;
}

const STORAGE_KEYS = {
  ATTEMPTS: 'leetcamp_v3_attempts',
  ACTIVE_PLAN: 'leetcamp_v3_active_plan',
  SOLVED_MAP: 'leetcamp_solved_problems',
  USER_STATS: 'leetcamp_v3_stats',
  BOOKMARKS: 'leetcamp_v3_bookmarks',
};

// Safe localStorage helper
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// -------------------------------------------------------------
// Attempt & Status Helpers
// -------------------------------------------------------------

export function getProblemAttempts(): Record<string, ProblemAttempt> {
  return getStorageItem<Record<string, ProblemAttempt>>(STORAGE_KEYS.ATTEMPTS, {});
}

export function recordProblemOutcome(
  problem: { id: number | string; slug: string; title: string; difficulty: string; company?: string; category?: string },
  status: SolveStatus,
  timeSpent = 15,
  notes = ''
): ProblemAttempt {
  const attempts = getProblemAttempts();
  const key = `${problem.slug}`;

  let xp = 0;
  if (status === 'mastered') xp = 50;
  else if (status === 'solved') xp = 25;
  else if (status === 'hint_used') xp = 15;
  else if (status === 'solution_needed') xp = 10;
  else if (status === 'attempted') xp = 5;

  const attempt: ProblemAttempt = {
    problemId: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    company: problem.company,
    category: problem.category,
    status,
    notes,
    timeSpentMinutes: timeSpent,
    xpEarned: xp,
    timestamp: Date.now(),
  };

  attempts[key] = attempt;
  setStorageItem(STORAGE_KEYS.ATTEMPTS, attempts);

  // Sync with classic solved map
  const solvedMap = getStorageItem<Record<string, boolean>>(STORAGE_KEYS.SOLVED_MAP, {});
  if (status === 'solved' || status === 'mastered') {
    solvedMap[key] = true;
    if (problem.company) solvedMap[`comp_${problem.company}_${problem.id}`] = true;
    if (problem.category) solvedMap[`pattern_${problem.category}_${problem.id}`] = true;
  }
  setStorageItem(STORAGE_KEYS.SOLVED_MAP, solvedMap);

  // Update Stats & Streak
  updateStreakAndStats(xp);

  // Update active plan if problem is in current plan
  updateProblemInActivePlan(problem.slug, status === 'solved' || status === 'mastered');

  return attempt;
}

// -------------------------------------------------------------
// Active Preparation Plan Helpers
// -------------------------------------------------------------

export function getActivePreparationPlan(): PreparationPlan | null {
  return getStorageItem<PreparationPlan | null>(STORAGE_KEYS.ACTIVE_PLAN, null);
}

export function saveActivePreparationPlan(plan: PreparationPlan): void {
  setStorageItem(STORAGE_KEYS.ACTIVE_PLAN, plan);
}

export function clearActivePreparationPlan(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAN);
}

export function updateProblemInActivePlan(slug: string, isSolved: boolean): void {
  const plan = getActivePreparationPlan();
  if (!plan) return;

  let changed = false;
  for (const day of plan.days) {
    for (const p of day.problems) {
      if (p.slug === slug) {
        p.solved = isSolved;
        changed = true;
      }
    }
  }

  if (changed) {
    saveActivePreparationPlan(plan);
  }
}

// -------------------------------------------------------------
// User Stats & Streak Engine
// -------------------------------------------------------------

export function getUserStats(): UserStats {
  const defaultStats: UserStats = {
    solvedCount: 0,
    masteredCount: 0,
    attemptedCount: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalXp: 0,
  };

  const stats = getStorageItem<UserStats>(STORAGE_KEYS.USER_STATS, defaultStats);
  const attempts = Object.values(getProblemAttempts());

  // Derive counts dynamically
  stats.solvedCount = attempts.filter((a) => a.status === 'solved' || a.status === 'mastered').length;
  stats.masteredCount = attempts.filter((a) => a.status === 'mastered').length;
  stats.attemptedCount = attempts.length;

  return stats;
}

function updateStreakAndStats(newXp: number): void {
  const stats = getUserStats();
  const today = new Date().toISOString().split('T')[0];

  if (stats.lastActiveDate !== today) {
    const lastDate = new Date(stats.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stats.streakDays += 1;
    } else if (diffDays > 1) {
      stats.streakDays = 1;
    }
    stats.lastActiveDate = today;
  }

  stats.totalXp += newXp;
  setStorageItem(STORAGE_KEYS.USER_STATS, stats);
}

// -------------------------------------------------------------
// Weakness & Pattern Performance Analyzer
// -------------------------------------------------------------

export interface PatternPerformance {
  pattern: string;
  totalAttempted: number;
  solved: number;
  hintOrSolutionNeeded: number;
  successRate: number;
  level: 'critical' | 'moderate' | 'strong';
}

export function getWeakAreasAnalysis(): PatternPerformance[] {
  const attempts = Object.values(getProblemAttempts());
  const patternMap: Record<string, { total: number; solved: number; hints: number }> = {};

  for (const a of attempts) {
    const pattern = a.category || 'General DSA';
    if (!patternMap[pattern]) {
      patternMap[pattern] = { total: 0, solved: 0, hints: 0 };
    }
    patternMap[pattern].total++;
    if (a.status === 'solved' || a.status === 'mastered') {
      patternMap[pattern].solved++;
    } else if (a.status === 'hint_used' || a.status === 'solution_needed') {
      patternMap[pattern].hints++;
    }
  }

  const results: PatternPerformance[] = [];

  for (const [pattern, stat] of Object.entries(patternMap)) {
    const successRate = stat.total > 0 ? Math.round((stat.solved / stat.total) * 100) : 0;
    let level: 'critical' | 'moderate' | 'strong' = 'strong';
    if (successRate < 45) level = 'critical';
    else if (successRate < 70) level = 'moderate';

    results.push({
      pattern,
      totalAttempted: stat.total,
      solved: stat.solved,
      hintOrSolutionNeeded: stat.hints,
      successRate,
      level,
    });
  }

  return results.sort((a, b) => a.successRate - b.successRate);
}
