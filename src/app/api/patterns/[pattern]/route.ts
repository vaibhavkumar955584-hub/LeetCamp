import { NextRequest, NextResponse } from 'next/server';
import { getPatternProblems, getPatternOverview, getExactPatternCategory } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    pattern: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await context.params;
    const rawPattern = resolvedParams.pattern;

    if (!rawPattern || typeof rawPattern !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Pattern slug or category name is required.' },
        { status: 400 }
      );
    }

    const patternDecoded = decodeURIComponent(rawPattern).trim();
    const patternInfo = getExactPatternCategory(patternDecoded);

    if (!patternInfo) {
      return NextResponse.json(
        { error: 'Not Found', message: `Pattern '${patternDecoded}' not found in database.` },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const difficultyParam = searchParams.get('difficulty');
    const companyParam = searchParams.get('company');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    let page = 1;
    if (pageParam !== null) {
      page = parseInt(pageParam, 10);
      if (isNaN(page) || page < 1) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid page parameter. Must be a positive integer.' },
          { status: 400 }
        );
      }
    }

    let limit = 50;
    if (limitParam !== null) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1 || limit > 500) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid limit parameter. Must be an integer between 1 and 500.' },
          { status: 400 }
        );
      }
    }

    let difficulty: string | string[] | undefined = undefined;
    if (difficultyParam) {
      difficulty = difficultyParam.split(',').map((d) => d.trim()).filter(Boolean);
    }

    const result = getPatternProblems(patternInfo.slug, {
      difficulty,
      company: companyParam || undefined,
      search: searchParam || undefined,
      sort: sortParam || undefined,
      page,
      limit,
    });

    const overview = getPatternOverview(patternInfo.slug);

    return NextResponse.json(
      {
        category: patternInfo.category,
        slug: patternInfo.slug,
        overview,
        problems: result.problems,
        pagination: result.pagination,
        filters: result.filters,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/patterns/[pattern]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
