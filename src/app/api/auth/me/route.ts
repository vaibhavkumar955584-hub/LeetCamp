import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('guest_session')?.value;
  const user = getSessionUser(sessionId);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user });
}
