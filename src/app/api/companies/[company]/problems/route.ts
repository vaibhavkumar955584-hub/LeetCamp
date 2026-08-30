import { NextRequest, NextResponse } from 'next/server';
import { getCompanyProblems, getExactCompanyName, getCompanyOverview } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    company: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await context.params;
    const rawCompany = resolvedParams.company;

    if (!rawCompany || typeof rawCompany !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Company name is required.' },
        { status: 400 }
      );
    }

    const companyDecoded = decodeURIComponent(rawCompany).trim();
    const exactCompany = getExactCompanyName(companyDecoded);

    if (!exactCompany) {
      return NextResponse.json(
        { error: 'Not Found', message: `Company '${companyDecoded}' not found in database.` },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const difficultyParam = searchParams.get('difficulty');
    const timeframeParam = searchParams.get('timeframe');
    const searchParam = searchParams.get('search');
    const topicParam = searchParams.get('topic');
    const trackParam = searchParams.get('track');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Validate page & limit
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

    // Validate difficulty values if provided
    let difficulty: string | string[] | undefined = undefined;
    if (difficultyParam) {
      const validDiffs = ['easy', 'medium', 'hard'];
      const rawList = difficultyParam.split(',').map((d) => d.trim()).filter(Boolean);
      for (const d of rawList) {
        if (!validDiffs.includes(d.toLowerCase())) {
          return NextResponse.json(
            { error: 'Bad Request', message: `Invalid difficulty value '${d}'. Allowed values are Easy, Medium, Hard.` },
            { status: 400 }
          );
        }
      }
      difficulty = rawList;
    }

    const result = getCompanyProblems(exactCompany, {
      difficulty,
      timeframe: timeframeParam || undefined,
      search: searchParam || undefined,
      topic: topicParam || undefined,
      track: trackParam || undefined,
      sort: sortParam || undefined,
      page,
      limit,
    });

    const overview = getCompanyOverview(exactCompany);

    return NextResponse.json({
      company: exactCompany,
      overview,
      problems: result.problems,
      pagination: result.pagination,
      filters: result.filters,
    }, {
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in GET /api/companies/[company]/problems:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
