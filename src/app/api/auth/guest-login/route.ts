import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { hashPassword, verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    const db = getDatabase();

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT (datetime('now')),
        last_login_at DATETIME
      );
      CREATE TABLE IF NOT EXISTS guest_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT (datetime('now')),
        expires_at DATETIME NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const existing = db.prepare(`SELECT id, password_hash FROM users WHERE email = ? COLLATE NOCASE`).get(email.trim()) as any;
    let userId: number;
    if (!existing) {
      const hash = hashPassword(password);
      const info = db.prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`).run(email.trim(), hash);
      userId = Number(info.lastInsertRowid);
    } else {
      if (!verifyPassword(password, existing.password_hash)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      userId = existing.id;
      db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(userId);
    }

    const { sessionId, expires } = createSession(userId);
    const res = NextResponse.json({ ok: true, email: email.trim() });
    res.cookies.set('guest_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expires)
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
