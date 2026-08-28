import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const defaultPath = path.resolve(process.cwd(), 'data', 'problems.db');
    const dbPath = process.env.SQLITE_DB_PATH ? path.resolve(process.env.SQLITE_DB_PATH) : defaultPath;
    
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    
    try {
      dbInstance = new Database(dbPath, { readonly: false });
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
    } catch {
      // Fallback to readonly if directory permissions prevent WAL creation
      dbInstance = new Database(dbPath, { readonly: true });
    }
  }
  return dbInstance;
}

export interface CompanySummary {
  company: string;
  count: number;
  easy_count?: number;
  medium_count?: number;
  hard_count?: number;
}

export interface Problem {
  id: number;
  company: string;
  title: string;
  slug: string;
  leetcode_url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeframe: string;
  frequency: number | null;
  acceptance: number | null;
  topics: string | null;
}

export interface ProblemFilterParams {
  difficulty?: string | string[];
  timeframe?: string;
  search?: string;
  topic?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function getAllCompanies(search?: string): CompanySummary[] {
  const db = getDatabase();
  let query = `
    SELECT 
      company, 
      COUNT(DISTINCT slug) as count,
      COUNT(DISTINCT CASE WHEN difficulty = 'Easy' THEN slug END) as easy_count,
      COUNT(DISTINCT CASE WHEN difficulty = 'Medium' THEN slug END) as medium_count,
      COUNT(DISTINCT CASE WHEN difficulty = 'Hard' THEN slug END) as hard_count
    FROM problems
  `;

  const params: any[] = [];
  if (search && search.trim()) {
    query += ` WHERE company LIKE ?`;
    params.push(`%${search.trim()}%`);
  }

  query += ` GROUP BY company ORDER BY company COLLATE NOCASE ASC`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as CompanySummary[];
}

export function checkCompanyExists(companyName: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT 1 FROM problems WHERE company = ? COLLATE NOCASE LIMIT 1`);
  const result = stmt.get(companyName);
  return !!result;
}

export function getExactCompanyName(companyName: string): string | null {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT company FROM problems WHERE company = ? COLLATE NOCASE LIMIT 1`);
  const result = stmt.get(companyName) as { company: string } | undefined;
  return result ? result.company : null;
}

export function getCompanyTopics(company: string): string[] {
  const db = getDatabase();
  const exactCompany = getExactCompanyName(company);
  if (!exactCompany) return [];

  const stmt = db.prepare(`
    SELECT DISTINCT topics FROM problems WHERE company = ? AND topics IS NOT NULL AND topics != ''
  `);
  const rows = stmt.all(exactCompany) as { topics: string }[];
  const topicSet = new Set<string>();

  for (const row of rows) {
    if (row.topics) {
      const parts = row.topics.split(',').map((t) => t.trim()).filter(Boolean);
      for (const p of parts) {
        topicSet.add(p);
      }
    }
  }

  return Array.from(topicSet).sort((a, b) => a.localeCompare(b));
}

export function getCompanyProblems(
  company: string,
  params: ProblemFilterParams
): {
  problems: Problem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    difficulties: string[];
    timeframe: string | null;
    search: string | null;
    topic: string | null;
    sort: string;
  };
} {
  const db = getDatabase();
  const exactCompany = getExactCompanyName(company);
  if (!exactCompany) {
    throw new Error(`Company '${company}' not found`);
  }

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(params.limit) || 50));
  const offset = (page - 1) * limit;

  const whereClauses: string[] = ['company = ?'];
  const queryParams: any[] = [exactCompany];

  // Difficulty filter
  let diffArray: string[] = [];
  if (params.difficulty) {
    if (Array.isArray(params.difficulty)) {
      diffArray = params.difficulty;
    } else {
      diffArray = params.difficulty.split(',').map((d) => d.trim()).filter(Boolean);
    }
  }

  if (diffArray.length > 0) {
    const placeholders = diffArray.map(() => '?').join(',');
    whereClauses.push(`difficulty IN (${placeholders})`);
    queryParams.push(...diffArray);
  }

  // Timeframe filter
  let timeframeFilter: string | null = null;
  if (params.timeframe && params.timeframe.trim() && params.timeframe !== 'all') {
    timeframeFilter = params.timeframe.trim();
    // Normalize aliases
    if (timeframeFilter === '30') timeframeFilter = '30_days';
    if (timeframeFilter === '90' || timeframeFilter === '3_months') timeframeFilter = '90_days';
    if (timeframeFilter === '60') timeframeFilter = '6_months';
    if (timeframeFilter === '6_months') timeframeFilter = '6_months';
    if (timeframeFilter === 'more_than_six_months' || timeframeFilter === 'more_than_6_months') timeframeFilter = 'more_than_six_months';
    if (timeframeFilter === 'all_time') timeframeFilter = 'all_time';
    
    whereClauses.push(`timeframe = ?`);
    queryParams.push(timeframeFilter);
  } else if (!params.timeframe || params.timeframe === 'all' || params.timeframe === 'all_time') {
    // Default to all_time timeframe for clean single-entry per problem
    timeframeFilter = 'all_time';
    whereClauses.push(`timeframe = ?`);
    queryParams.push(timeframeFilter);
  }

  // Text search filter
  let searchTerm: string | null = null;
  if (params.search && params.search.trim()) {
    searchTerm = params.search.trim();
    whereClauses.push(`(title LIKE ? OR topics LIKE ?)`);
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  // Topic filter
  let topicFilter: string | null = null;
  if (params.topic && params.topic.trim() && params.topic !== 'ALL') {
    topicFilter = params.topic.trim();
    whereClauses.push(`topics LIKE ?`);
    queryParams.push(`%${topicFilter}%`);
  }

  const whereSql = whereClauses.join(' AND ');

  // Total count query
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM problems WHERE ${whereSql}`);
  const countResult = countStmt.get(...queryParams) as { total: number };
  const total = countResult ? countResult.total : 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // Sorting SQL clause
  let sortKey = (params.sort || 'frequency').trim();
  let orderBySql = 'CASE WHEN frequency IS NOT NULL THEN frequency ELSE -1 END DESC, id ASC';

  switch (sortKey) {
    case 'frequency-asc':
      orderBySql = 'CASE WHEN frequency IS NOT NULL THEN frequency ELSE 999999 END ASC, id ASC';
      break;
    case 'title':
    case 'title-asc':
      orderBySql = 'title COLLATE NOCASE ASC, id ASC';
      break;
    case 'title-desc':
      orderBySql = 'title COLLATE NOCASE DESC, id ASC';
      break;
    case 'difficulty':
    case 'difficulty-asc':
      orderBySql = "CASE difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END ASC, id ASC";
      break;
    case 'difficulty-desc':
      orderBySql = "CASE difficulty WHEN 'Hard' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Easy' THEN 3 ELSE 4 END ASC, id ASC";
      break;
    case 'acceptance':
    case 'acceptance-desc':
      orderBySql = 'CASE WHEN acceptance IS NOT NULL THEN acceptance ELSE -1 END DESC, id ASC';
      break;
    case 'acceptance-asc':
      orderBySql = 'CASE WHEN acceptance IS NOT NULL THEN acceptance ELSE 999999 END ASC, id ASC';
      break;
    case 'frequency':
    case 'frequency-desc':
    default:
      sortKey = 'frequency';
      orderBySql = 'CASE WHEN frequency IS NOT NULL THEN frequency ELSE -1 END DESC, id ASC';
      break;
  }

  // Data query with server-side ordering
  const dataStmt = db.prepare(`
    SELECT id, company, title, slug, leetcode_url, difficulty, timeframe, frequency, acceptance, topics
    FROM problems
    WHERE ${whereSql}
    ORDER BY ${orderBySql}
    LIMIT ? OFFSET ?
  `);

  const problems = dataStmt.all(...queryParams, limit, offset) as Problem[];

  return {
    problems,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
    filters: {
      difficulties: diffArray,
      timeframe: timeframeFilter,
      search: searchTerm,
      topic: topicFilter,
      sort: sortKey,
    },
  };
}

export function getCompanyOverview(company: string) {
  const db = getDatabase();
  const exactCompany = getExactCompanyName(company);
  if (!exactCompany) return null;

  const statsStmt = db.prepare(`
    SELECT 
      COUNT(DISTINCT slug) as total,
      COUNT(DISTINCT CASE WHEN difficulty = 'Easy' THEN slug END) as easy,
      COUNT(DISTINCT CASE WHEN difficulty = 'Medium' THEN slug END) as medium,
      COUNT(DISTINCT CASE WHEN difficulty = 'Hard' THEN slug END) as hard
    FROM problems
    WHERE company = ?
  `);

  const stats = statsStmt.get(exactCompany) as any;

  const timeframesStmt = db.prepare(`
    SELECT DISTINCT timeframe FROM problems WHERE company = ?
  `);
  const timeframes = (timeframesStmt.all(exactCompany) as any[]).map((r) => r.timeframe);

  return {
    company: exactCompany,
    stats,
    timeframes,
  };
}

export function getDatasetMetadata() {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT key, value FROM _metadata').all() as { key: string; value: string }[];
    const meta: Record<string, string> = {};
    for (const r of rows) {
      meta[r.key] = r.value;
    }
    return {
      lastIngestedAt: meta['last_ingested_at'] || null,
      totalRows: meta['total_rows'] ? parseInt(meta['total_rows'], 10) : null,
      totalCompanies: meta['total_companies'] ? parseInt(meta['total_companies'], 10) : null,
    };
  } catch {
    return {
      lastIngestedAt: null,
      totalRows: null,
      totalCompanies: null,
    };
  }
}

export function checkDbHealth(): { ok: boolean; count: number; error?: string } {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as total FROM problems').get() as { total: number };
    return { ok: true, count: result.total };
  } catch (err: any) {
    return { ok: false, count: 0, error: err.message };
  }
}

