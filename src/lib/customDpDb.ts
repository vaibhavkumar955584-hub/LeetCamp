import Database from 'better-sqlite3';
import { getDatabase } from './db';

export interface CustomDpProblem {
  id: string;
  user_id: number;
  title: string;
  url: string;
  notes: string | null;
  difficulty: string | null;
  tags: string | null;
  solved_on: string | null;
  revision: number;
  is_public: number;
  created_at: number;
  updated_at: number;
}

export interface CustomDpProblemInput {
  title: string;
  url: string;
  notes?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  solvedOn?: string;
  revision?: boolean;
  isPublic?: boolean;
}

export function ensureCustomDpTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_dp_problems (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      notes TEXT,
      difficulty TEXT,
      tags TEXT,
      solved_on TEXT,
      revision INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_custom_dp_user ON custom_dp_problems(user_id);
    CREATE INDEX IF NOT EXISTS idx_custom_dp_public ON custom_dp_problems(is_public);
    CREATE INDEX IF NOT EXISTS idx_custom_dp_solved ON custom_dp_problems(solved_on);
  `);
}

export function getCustomDpProblems(userId: number): CustomDpProblem[] {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const stmt = db.prepare(`SELECT * FROM custom_dp_problems WHERE user_id = ? ORDER BY created_at DESC`);
  return stmt.all(userId) as CustomDpProblem[];
}

export function getCustomDpProblemById(id: string, userId: number): CustomDpProblem | null {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const stmt = db.prepare(`SELECT * FROM custom_dp_problems WHERE id = ? AND user_id = ?`);
  return (stmt.get(id, userId) as CustomDpProblem) || null;
}

export function createCustomDpProblem(userId: number, input: CustomDpProblemInput): CustomDpProblem {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const id = `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO custom_dp_problems (id, user_id, title, url, notes, difficulty, tags, solved_on, revision, is_public, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    userId,
    input.title.trim(),
    input.url.trim(),
    input.notes || null,
    input.difficulty || null,
    input.tags ? JSON.stringify(input.tags) : null,
    input.solvedOn || null,
    input.revision ? 1 : 0,
    input.isPublic ? 1 : 0,
    now,
    now
  );
  return {
    id,
    user_id: userId,
    title: input.title.trim(),
    url: input.url.trim(),
    notes: input.notes || null,
    difficulty: input.difficulty || null,
    tags: input.tags ? JSON.stringify(input.tags) : null,
    solved_on: input.solvedOn || null,
    revision: input.revision ? 1 : 0,
    is_public: input.isPublic ? 1 : 0,
    created_at: now,
    updated_at: now,
  };
}

export function updateCustomDpProblem(id: string, userId: number, input: Partial<CustomDpProblemInput>): CustomDpProblem | null {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const existing = getCustomDpProblemById(id, userId);
  if (!existing) return null;

  const now = Date.now();
  const fields: string[] = [];
  const values: any[] = [];

  if (input.title !== undefined) { fields.push('title = ?'); values.push(input.title.trim()); }
  if (input.url !== undefined) { fields.push('url = ?'); values.push(input.url.trim()); }
  if (input.notes !== undefined) { fields.push('notes = ?'); values.push(input.notes || null); }
  if (input.difficulty !== undefined) { fields.push('difficulty = ?'); values.push(input.difficulty || null); }
  if (input.tags !== undefined) { fields.push('tags = ?'); values.push(input.tags ? JSON.stringify(input.tags) : null); }
  if (input.solvedOn !== undefined) { fields.push('solved_on = ?'); values.push(input.solvedOn || null); }
  if (input.revision !== undefined) { fields.push('revision = ?'); values.push(input.revision ? 1 : 0); }
  if (input.isPublic !== undefined) { fields.push('is_public = ?'); values.push(input.isPublic ? 1 : 0); }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id, userId);

  const stmt = db.prepare(`UPDATE custom_dp_problems SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`);
  stmt.run(...values);
  return getCustomDpProblemById(id, userId);
}

export function deleteCustomDpProblem(id: string, userId: number): boolean {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const stmt = db.prepare(`DELETE FROM custom_dp_problems WHERE id = ? AND user_id = ?`);
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

export function getPublicCustomDpProblems(): CustomDpProblem[] {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const stmt = db.prepare(`SELECT * FROM custom_dp_problems WHERE is_public = 1 ORDER BY created_at DESC LIMIT 100`);
  return stmt.all() as CustomDpProblem[];
}

export function getSharedCustomDpProblems(userId: number): CustomDpProblem[] {
  const db = getDatabase();
  ensureCustomDpTables(db);
  const stmt = db.prepare(`
    SELECT * FROM custom_dp_problems 
    WHERE is_public = 1 OR user_id = ? 
    ORDER BY created_at DESC
  `);
  return stmt.all(userId) as CustomDpProblem[];
}