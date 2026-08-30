import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getExactCompanyName } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company = 'Google',
      companies = [],
      goal = 'Company interview',
      duration = 30,
      level = 'Intermediate',
      dailyTarget = 3
    } = body;

    const db = getDatabase();
    const targetCompanies = companies.length > 0 ? companies : [company];
    const exactCompanies = targetCompanies
      .map((c: string) => getExactCompanyName(c))
      .filter(Boolean) as string[];

    const finalCompany = exactCompanies[0] || 'Google';

    // Fetch company problems sorted by frequency
    let companyProblems = db.prepare(`
      SELECT id, company, title, slug, leetcode_url as url, difficulty, topics, MAX(COALESCE(frequency, 0)) as frequency
      FROM problems
      WHERE company IN (${exactCompanies.map(() => '?').join(',')})
      GROUP BY slug
      ORDER BY frequency DESC
      LIMIT ?
    `).all(...exactCompanies, duration * dailyTarget * 2) as any[];

    if (companyProblems.length === 0) {
      // Fallback to top general problems
      companyProblems = db.prepare(`
        SELECT id, company, title, slug, leetcode_url as url, difficulty, topics, MAX(COALESCE(frequency, 0)) as frequency
        FROM problems
        GROUP BY slug
        ORDER BY frequency DESC
        LIMIT ?
      `).all(duration * dailyTarget * 2) as any[];
    }

    // Difficulty ratio filter
    let easyRatio = 0.2;
    let medRatio = 0.65;
    let hardRatio = 0.15;

    if (level === 'Beginner') {
      easyRatio = 0.6;
      medRatio = 0.4;
      hardRatio = 0.0;
    } else if (level === 'Advanced') {
      easyRatio = 0.1;
      medRatio = 0.5;
      hardRatio = 0.4;
    }

    // Separate problems into pools
    const easyPool = companyProblems.filter((p) => p.difficulty === 'Easy');
    const medPool = companyProblems.filter((p) => p.difficulty === 'Medium');
    const hardPool = companyProblems.filter((p) => p.difficulty === 'Hard');

    // Build day-by-day plan
    const days: any[] = [];
    const usedSlugs = new Set<string>();

    const patternThemes = [
      'Arrays & Hash Tables',
      'Two Pointers & Sliding Window',
      'Stack & Monotonic Stack',
      'Binary Search & Sorting',
      'Linked Lists & Pointers',
      'Trees & Tree Traversals',
      'Binary Search Trees',
      'Graphs & BFS/DFS',
      'Topological Sort & Disjoint Set',
      'Dynamic Programming: 1D',
      'Dynamic Programming: 2D & Grids',
      'Backtracking & Recursion',
      'Greedy & Interval Scheduling',
      'Heaps & Priority Queues',
      'Tries & String Algorithms',
      'Bit Manipulation & Math',
    ];

    for (let dayNum = 1; dayNum <= duration; dayNum++) {
      const dayTheme = patternThemes[(dayNum - 1) % patternThemes.length];
      const dayProblems: any[] = [];

      for (let pIdx = 0; pIdx < dailyTarget; pIdx++) {
        // Pick difficulty according to ratio
        let pool = medPool;
        if (pIdx === 0 && easyPool.length > 0 && Math.random() < easyRatio + 0.3) {
          pool = easyPool;
        } else if (pIdx === dailyTarget - 1 && hardPool.length > 0 && Math.random() < hardRatio + 0.2) {
          pool = hardPool;
        }

        // Find unused problem
        let chosen = pool.find((p) => !usedSlugs.has(p.slug));
        if (!chosen) {
          chosen = companyProblems.find((p) => !usedSlugs.has(p.slug));
        }

        if (chosen) {
          usedSlugs.add(chosen.slug);
          dayProblems.push({
            id: chosen.id,
            title: chosen.title,
            slug: chosen.slug,
            difficulty: chosen.difficulty,
            frequency: chosen.frequency,
            url: chosen.url,
            topics: chosen.topics,
            solved: false,
          });
        }
      }

      if (dayProblems.length > 0) {
        days.push({
          dayNumber: dayNum,
          title: `Day ${dayNum} — ${dayTheme}`,
          focusPattern: dayTheme,
          problems: dayProblems,
        });
      }
    }

    const totalProblems = days.reduce((acc, d) => acc + d.problems.length, 0);

    const plan = {
      id: `plan_${Date.now()}_${finalCompany.toLowerCase()}`,
      goal,
      company: finalCompany,
      companies: exactCompanies,
      durationDays: duration,
      level,
      dailyTarget,
      totalProblems,
      createdAt: Date.now(),
      currentDay: 1,
      days,
    };

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
