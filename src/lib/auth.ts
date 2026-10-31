import crypto from 'crypto';
import { getDatabase } from './db';

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const check = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
  } catch {
    return false;
  }
}

export function createSession(userId: number): { sessionId: string; expires: string } {
  const db = getDatabase();
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`INSERT INTO guest_sessions (id, user_id, expires_at) VALUES (?, ?, ?)`).run(sessionId, userId, expires);
  return { sessionId, expires };
}

export function getSessionUser(sessionId?: string) {
  if (!sessionId) return null;
  const db = getDatabase();
  try {
    const row = db.prepare(`
      SELECT u.id, u.email FROM guest_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `).get(sessionId) as any;
    return row || null;
  } catch {
    return null;
  }
}
