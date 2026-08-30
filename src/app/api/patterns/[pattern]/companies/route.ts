import { NextRequest, NextResponse } from 'next/server';
import { getPatternOverview, getExactPatternCategory } from '@/lib/db';

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
        { error: 'Bad Request', message: 'Pattern slug is required.' },
        { status: 400 }
      );
    }

    const patternDecoded = decodeURIComponent(rawPattern).trim();
    const patternInfo = getExactPatternCategory(patternDecoded);

    if (!patternInfo) {
      return NextResponse.json(
        { error: 'Not Found', message: `Pattern '${patternDecoded}' not found.` },
        { status: 404 }
      );
    }

    const overview = getPatternOverview(patternInfo.slug);

    return NextResponse.json(
      {
        category: patternInfo.category,
        slug: patternInfo.slug,
        companies: overview?.companies || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/patterns/[pattern]/companies:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
