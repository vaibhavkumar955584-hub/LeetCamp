import { NextResponse } from 'next/server';
import { checkDbHealth, getDatasetMetadata } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const dbHealth = checkDbHealth();
  const meta = getDatasetMetadata();
  const latencyMs = Date.now() - startTime;

  if (!dbHealth.ok) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: 'ERROR',
          error: dbHealth.error,
        },
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: 'OK',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      latencyMs,
      database: {
        status: 'CONNECTED',
        driver: 'better-sqlite3 (WAL)',
        totalRecords: dbHealth.count,
        totalCompanies: meta.totalCompanies,
        lastIngestedAt: meta.lastIngestedAt,
      },
      environment: process.env.NODE_ENV || 'production',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
