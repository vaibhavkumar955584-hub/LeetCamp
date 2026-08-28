import { NextRequest, NextResponse } from 'next/server';
import { getCompanyTopics, getExactCompanyName } from '@/lib/db';

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

    const topics = getCompanyTopics(exactCompany);

    return NextResponse.json({
      company: exactCompany,
      topics,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/companies/[company]/topics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
