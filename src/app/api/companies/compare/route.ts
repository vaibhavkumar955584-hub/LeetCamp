import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getExactCompanyName } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const compsParam = searchParams.get('companies') || 'Google,Amazon,Meta';
    const rawList = compsParam.split(',').map((c) => c.trim()).filter(Boolean);

    const exactCompanies = rawList
      .map((c) => getExactCompanyName(c))
      .filter(Boolean) as string[];

    if (exactCompanies.length < 2) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'At least 2 valid companies are required for comparison.' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 1. Fetch breakdown for each company
    const companyOverviews: any[] = [];
    for (const comp of exactCompanies) {
      const stats = db.prepare(`
        SELECT 
          COUNT(DISTINCT slug) as total,
          COUNT(DISTINCT CASE WHEN difficulty = 'Easy' THEN slug END) as easy,
          COUNT(DISTINCT CASE WHEN difficulty = 'Medium' THEN slug END) as medium,
          COUNT(DISTINCT CASE WHEN difficulty = 'Hard' THEN slug END) as hard
        FROM problems
        WHERE company = ?
      `).get(comp) as any;

      // Top topics
      const topics = db.prepare(`
        SELECT topics, COUNT(*) as c
        FROM problems
        WHERE company = ? AND topics IS NOT NULL
        GROUP BY topics
        ORDER BY c DESC
        LIMIT 6
      `).all(comp) as any[];

      companyOverviews.push({
        company: comp,
        stats,
        topTopics: topics,
      });
    }

    // 2. Find common shared problems across all selected companies
    const placeholders = exactCompanies.map(() => '?').join(',');
    const sharedStmt = db.prepare(`
      SELECT 
        title, 
        slug, 
        difficulty, 
        leetcode_url,
        topics,
        COUNT(DISTINCT company) as comp_count,
        ROUND(AVG(COALESCE(frequency, 0)), 1) as avg_frequency
      FROM problems
      WHERE company IN (${placeholders})
      GROUP BY slug
      HAVING comp_count = ?
      ORDER BY avg_frequency DESC
      LIMIT 50
    `);

    const sharedProblems = sharedStmt.all(...exactCompanies, exactCompanies.length) as any[];

    return NextResponse.json({
      companies: exactCompanies,
      overviews: companyOverviews,
      sharedCount: sharedProblems.length,
      sharedProblems,
    });
  } catch (error: any) {
    console.error('Error in compare API:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
