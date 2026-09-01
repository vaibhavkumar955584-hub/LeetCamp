import { NextRequest, NextResponse } from 'next/server';
import { searchQuestionsKeyByKey, getQuestionCompanyDetails } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const slug = searchParams.get('slug');
    const title = searchParams.get('title');
    const limitParam = searchParams.get('limit');

    // 1. If slug or title is provided, return the full question company breakdown
    if (slug || title) {
      const target = slug || title;
      const details = getQuestionCompanyDetails(target!);

      if (!details) {
        return NextResponse.json(
          { error: 'Not Found', message: `Question '${target}' not found in database.` },
          { status: 404 }
        );
      }

      return NextResponse.json(details, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      });
    }

    // 2. Key-by-key real-time search query
    if (query !== null) {
      const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20)) : 20;
      const results = searchQuestionsKeyByKey(query, limit);

      return NextResponse.json(
        {
          query,
          count: results.length,
          results,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    // If neither is provided, return empty search result or popular defaults
    const defaultSuggestions = searchQuestionsKeyByKey('Two Sum', 10);
    return NextResponse.json(
      {
        query: '',
        count: defaultSuggestions.length,
        results: defaultSuggestions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/questions/search:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
