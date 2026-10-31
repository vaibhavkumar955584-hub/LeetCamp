import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('guest_session')?.value;
    const user = getSessionUser(sessionId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDatabase();
    const days = 8;
    let rows: any[] = [];
    try {
      rows = db.prepare(`
        SELECT id, title, slug, leetcode_url, difficulty, topics, company, created_at
        FROM questions
        WHERE created_at >= datetime('now', ?)
        ORDER BY created_at DESC, id DESC
      `).all(`-${days} days`) as any[];
    } catch {
      try {
        rows = db.prepare(`SELECT id, title, slug, leetcode_url, difficulty, topics, company FROM questions WHERE created_at >= datetime('now','-8 days') ORDER BY id DESC`).all() as any[];
      } catch {
        rows = [];
      }
    }

    const normalized = rows.map(r => ({
      id: String(r.id),
      title: r.title,
      url: r.leetcode_url || (r.slug ? `https://leetcode.com/problems/${r.slug}/` : '#'),
      addedAt: Date.now()
    }));

    return NextResponse.json({ questions: normalized, days, count: normalized.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
