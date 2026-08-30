import { NextRequest, NextResponse } from 'next/server';
import { getCompanyPatternProblems, getExactCompanyName } from '@/lib/db';

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
        { error: 'Not Found', message: `Company '${companyDecoded}' not found.` },
        { status: 404 }
      );
    }

    const patternProblems = getCompanyPatternProblems(exactCompany);

    return NextResponse.json(
      {
        company: exactCompany,
        count: patternProblems.length,
        problems: patternProblems,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/companies/[company]/patterns:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
