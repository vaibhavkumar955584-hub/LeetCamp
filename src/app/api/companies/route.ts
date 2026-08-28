import { NextRequest, NextResponse } from 'next/server';
import { getAllCompanies } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const companies = getAllCompanies(search);

    // Format response adhering to spec: [{ company: string, count: number }]
    // We include additional metadata for rich frontend rendering
    return NextResponse.json(companies, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/companies:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
