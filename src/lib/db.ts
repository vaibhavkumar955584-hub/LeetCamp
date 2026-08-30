import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;

function findSourceDbPath(): string {
  if (process.env.SQLITE_DB_PATH && fs.existsSync(process.env.SQLITE_DB_PATH)) {
    return process.env.SQLITE_DB_PATH;
  }
  
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'problems.db'),
    path.resolve(process.cwd(), 'data', 'problems.db'),
    path.join(__dirname, '..', '..', '..', 'data', 'problems.db'),
    path.join(__dirname, '..', '..', 'data', 'problems.db'),
    path.join(__dirname, '..', 'data', 'problems.db'),
    path.join(process.cwd(), 'problems.db'),
    '/var/task/data/problems.db',
  ];
  
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {
      // Ignore permission check errors
    }
  }
  
  return path.join(process.cwd(), 'data', 'problems.db');
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const sourceDbPath = findSourceDbPath();
    let targetDbPath = sourceDbPath;

    // Check if we are running in Vercel / AWS Lambda / read-only serverless environment
    const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless || process.env.NODE_ENV === 'production') {
      try {
        const tmpDbPath = path.join('/tmp', 'problems.db');
        if (fs.existsSync(sourceDbPath)) {
          // If /tmp/problems.db does not exist or has different size, copy it to /tmp
          const sourceStat = fs.statSync(sourceDbPath);
          const needsCopy = !fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size !== sourceStat.size;
          
          if (needsCopy) {
            fs.copyFileSync(sourceDbPath, tmpDbPath);
          }
          if (fs.existsSync(tmpDbPath)) {
            targetDbPath = tmpDbPath;
          }
        }
      } catch (err: any) {
        console.warn('Serverless /tmp database replication note:', err.message);
      }
    }

    try {
      dbInstance = new Database(targetDbPath, { readonly: false, fileMustExist: false });
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
    } catch {
      try {
        // Fallback to readonly if directory permissions prevent WAL creation
        dbInstance = new Database(targetDbPath, { readonly: true, fileMustExist: false });
      } catch (err: any) {
        console.error('Critical database initialization error:', err.message);
        throw err;
      }
    }
  }
  return dbInstance;
}

// -------------------------------------------------------------
// Interfaces for Company Problems
// -------------------------------------------------------------

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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Basic';
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

// -------------------------------------------------------------
// Interfaces for DSA Pattern Collections
// -------------------------------------------------------------

export type PatternRoadmapGroup = 
  | 'Core Data Structures'
  | 'Trees & Hierarchies'
  | 'Graphs & Networks'
  | 'Algorithmic Techniques'
  | 'Dynamic Programming & Recursion'
  | 'Math & Advanced Concepts';

export interface PatternSummary {
  category: string;
  slug: string;
  group: PatternRoadmapGroup;
  count: number;
  basic_count: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  avg_accuracy?: number;
}

export interface PatternProblem {
  id: number;
  category: string;
  category_slug: string;
  difficulty: 'Basic' | 'Easy' | 'Medium' | 'Hard';
  title: string;
  company_tags: string | null;
  accuracy: number | null;
  url: string;
}

export interface PatternFilterParams {
  difficulty?: string | string[];
  company?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PatternOverview {
  category: string;
  slug: string;
  group: PatternRoadmapGroup;
  stats: {
    total: number;
    basic: number;
    easy: number;
    medium: number;
    hard: number;
    avgAccuracy: number | null;
  };
  companies: string[];
}

// -------------------------------------------------------------
// Roadmap Classification Helper
// -------------------------------------------------------------

export function getPatternGroup(category: string): PatternRoadmapGroup {
  const cat = category.toLowerCase();
  
  if (['tree', 'binary tree', 'binary search tree', 'avl tree', 'segment tree', 'binary indexed tree', 'trie'].includes(cat)) {
    return 'Trees & Hierarchies';
  }
  
  if (['graph', 'bfs', 'dfs', 'topological sort', 'shortest path', 'disjoint set'].includes(cat)) {
    return 'Graphs & Networks';
  }
  
  if (['two pointers', 'sliding window', 'binary search', 'searching', 'sorting', 'merge sort', 'prefix sum', 'kadane'].includes(cat)) {
    return 'Algorithmic Techniques';
  }
  
  if (['dynamic programming', 'lcs', 'recursion', 'backtracking', 'divide and conquer', 'greedy'].includes(cat)) {
    return 'Dynamic Programming & Recursion';
  }
  
  if (['bit magic', 'mathematics', 'number theory', 'combinatorial', 'game theory', 'geometric', 'matrix', 'sqrt decomposition'].includes(cat)) {
    return 'Math & Advanced Concepts';
  }
  
  return 'Core Data Structures';
}

// -------------------------------------------------------------
// Company Problems Queries
// -------------------------------------------------------------

export function getAllCompanies(search?: string): CompanySummary[] {
  try {
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
  } catch (err: any) {
    console.error('Error in getAllCompanies:', err);
    return [];
  }
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
    if (timeframeFilter === '30') timeframeFilter = '30_days';
    if (timeframeFilter === '90' || timeframeFilter === '3_months') timeframeFilter = '90_days';
    if (timeframeFilter === '60') timeframeFilter = '6_months';
    if (timeframeFilter === '6_months') timeframeFilter = '6_months';
    if (timeframeFilter === 'more_than_six_months' || timeframeFilter === 'more_than_6_months') timeframeFilter = 'more_than_six_months';
    if (timeframeFilter === 'all_time') timeframeFilter = 'all_time';
    
    whereClauses.push(`timeframe = ?`);
    queryParams.push(timeframeFilter);
  } else if (!params.timeframe || params.timeframe === 'all' || params.timeframe === 'all_time') {
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

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM problems WHERE ${whereSql}`);
  const countResult = countStmt.get(...queryParams) as { total: number };
  const total = countResult ? countResult.total : 0;
  const totalPages = Math.ceil(total / limit) || 1;

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

// -------------------------------------------------------------
// Pattern Problems Queries
// -------------------------------------------------------------

export function getAllPatterns(search?: string): PatternSummary[] {
  try {
    const db = getDatabase();
    let query = `
      SELECT 
        category,
        category_slug as slug,
        COUNT(*) as count,
        COUNT(CASE WHEN difficulty = 'Basic' THEN 1 END) as basic_count,
        COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy_count,
        COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard_count,
        ROUND(AVG(accuracy), 1) as avg_accuracy
      FROM pattern_problems
    `;

    const params: any[] = [];
    if (search && search.trim()) {
      query += ` WHERE category LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    query += ` GROUP BY category, category_slug ORDER BY count DESC, category ASC`;

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((r) => ({
      category: r.category,
      slug: r.slug,
      group: getPatternGroup(r.category),
      count: r.count,
      basic_count: r.basic_count || 0,
      easy_count: r.easy_count || 0,
      medium_count: r.medium_count || 0,
      hard_count: r.hard_count || 0,
      avg_accuracy: r.avg_accuracy || undefined,
    }));
  } catch (err: any) {
    console.error('Error in getAllPatterns:', err);
    return [];
  }
}

export function getExactPatternCategory(slug: string): { category: string; slug: string } | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT category, category_slug as slug 
    FROM pattern_problems 
    WHERE category_slug = ? OR category = ? COLLATE NOCASE 
    LIMIT 1
  `);
  const result = stmt.get(slug.toLowerCase().trim(), slug.trim()) as { category: string; slug: string } | undefined;
  return result || null;
}

export function getPatternOverview(slug: string): PatternOverview | null {
  const db = getDatabase();
  const patternInfo = getExactPatternCategory(slug);
  if (!patternInfo) return null;

  const statsStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN difficulty = 'Basic' THEN 1 END) as basic,
      COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy,
      COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium,
      COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard,
      ROUND(AVG(accuracy), 1) as avgAccuracy
    FROM pattern_problems
    WHERE category_slug = ?
  `);

  const stats = statsStmt.get(patternInfo.slug) as any;

  // Extract unique companies tagged in this pattern
  const companyRows = db.prepare(`
    SELECT company_tags 
    FROM pattern_problems 
    WHERE category_slug = ? AND company_tags IS NOT NULL AND company_tags != ''
  `).all(patternInfo.slug) as { company_tags: string }[];

  const companiesSet = new Set<string>();
  for (const r of companyRows) {
    if (r.company_tags) {
      r.company_tags.split(',').forEach((c) => {
        const clean = c.replace(/\+\d+/, '').trim();
        if (clean) companiesSet.add(clean);
      });
    }
  }

  return {
    category: patternInfo.category,
    slug: patternInfo.slug,
    group: getPatternGroup(patternInfo.category),
    stats: {
      total: stats.total || 0,
      basic: stats.basic || 0,
      easy: stats.easy || 0,
      medium: stats.medium || 0,
      hard: stats.hard || 0,
      avgAccuracy: stats.avgAccuracy || null,
    },
    companies: Array.from(companiesSet).sort((a, b) => a.localeCompare(b)),
  };
}

export function getPatternProblems(
  slug: string,
  params: PatternFilterParams
): {
  problems: PatternProblem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    difficulties: string[];
    company: string | null;
    search: string | null;
    sort: string;
  };
} {
  const db = getDatabase();
  const patternInfo = getExactPatternCategory(slug);
  if (!patternInfo) {
    throw new Error(`Pattern '${slug}' not found`);
  }

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(params.limit) || 50));
  const offset = (page - 1) * limit;

  const whereClauses: string[] = ['category_slug = ?'];
  const queryParams: any[] = [patternInfo.slug];

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

  // Company tag filter
  let companyFilter: string | null = null;
  if (params.company && params.company.trim() && params.company !== 'ALL') {
    companyFilter = params.company.trim();
    whereClauses.push(`company_tags LIKE ?`);
    queryParams.push(`%${companyFilter}%`);
  }

  // Text search filter
  let searchTerm: string | null = null;
  if (params.search && params.search.trim()) {
    searchTerm = params.search.trim();
    whereClauses.push(`(title LIKE ? OR company_tags LIKE ?)`);
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  const whereSql = whereClauses.join(' AND ');

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM pattern_problems WHERE ${whereSql}`);
  const countResult = countStmt.get(...queryParams) as { total: number };
  const total = countResult ? countResult.total : 0;
  const totalPages = Math.ceil(total / limit) || 1;

  let sortKey = (params.sort || 'accuracy-desc').trim();
  let orderBySql = 'CASE WHEN accuracy IS NOT NULL THEN accuracy ELSE -1 END DESC, id ASC';

  switch (sortKey) {
    case 'accuracy-asc':
      orderBySql = 'CASE WHEN accuracy IS NOT NULL THEN accuracy ELSE 999 END ASC, id ASC';
      break;
    case 'accuracy-desc':
    case 'accuracy':
      orderBySql = 'CASE WHEN accuracy IS NOT NULL THEN accuracy ELSE -1 END DESC, id ASC';
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
      orderBySql = "CASE difficulty WHEN 'Basic' THEN 1 WHEN 'Easy' THEN 2 WHEN 'Medium' THEN 3 WHEN 'Hard' THEN 4 ELSE 5 END ASC, id ASC";
      break;
    case 'difficulty-desc':
      orderBySql = "CASE difficulty WHEN 'Hard' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Easy' THEN 3 WHEN 'Basic' THEN 4 ELSE 5 END ASC, id ASC";
      break;
    default:
      sortKey = 'accuracy-desc';
      orderBySql = 'CASE WHEN accuracy IS NOT NULL THEN accuracy ELSE -1 END DESC, id ASC';
      break;
  }

  const dataStmt = db.prepare(`
    SELECT id, category, category_slug, difficulty, title, company_tags, accuracy, url
    FROM pattern_problems
    WHERE ${whereSql}
    ORDER BY ${orderBySql}
    LIMIT ? OFFSET ?
  `);

  const problems = dataStmt.all(...queryParams, limit, offset) as PatternProblem[];

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
      company: companyFilter,
      search: searchTerm,
      sort: sortKey,
    },
  };
}

export function getCompanyPatternProblems(companyName: string): PatternProblem[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, category, category_slug, difficulty, title, company_tags, accuracy, url
    FROM pattern_problems
    WHERE company_tags LIKE ?
    ORDER BY category ASC, id ASC
  `);
  return stmt.all(`%${companyName.trim()}%`) as PatternProblem[];
}

export function getGlobalStats() {
  const db = getDatabase();
  try {
    const metaRows = db.prepare('SELECT key, value FROM _metadata').all() as { key: string; value: string }[];
    const meta: Record<string, string> = {};
    for (const r of metaRows) {
      meta[r.key] = r.value;
    }

    const companyCount = db.prepare('SELECT COUNT(DISTINCT company) as c FROM problems').get() as { c: number };
    const companyProblemsCount = db.prepare('SELECT COUNT(DISTINCT slug) as c FROM problems').get() as { c: number };
    const patternCount = db.prepare('SELECT COUNT(DISTINCT category_slug) as c FROM pattern_problems').get() as { c: number };
    const patternProblemsCount = db.prepare('SELECT COUNT(*) as c FROM pattern_problems').get() as { c: number };

    return {
      lastIngestedAt: meta['last_ingested_at'] || null,
      totalCompanies: companyCount?.c || 470,
      totalCompanyProblems: companyProblemsCount?.c || 37714,
      totalPatterns: patternCount?.c || 48,
      totalPatternProblems: patternProblemsCount?.c || 2961,
    };
  } catch {
    return {
      lastIngestedAt: null,
      totalCompanies: 470,
      totalCompanyProblems: 37714,
      totalPatterns: 48,
      totalPatternProblems: 2961,
    };
  }
}

export function getDatasetMetadata() {
  return getGlobalStats();
}

export function checkDbHealth(): { ok: boolean; count: number; error?: string } {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as total FROM problems').get() as { total: number };
    const patternResult = db.prepare('SELECT COUNT(*) as total FROM pattern_problems').get() as { total: number };
    return { ok: true, count: (result?.total || 0) + (patternResult?.total || 0) };
  } catch (err: any) {
    return { ok: false, count: 0, error: err.message };
  }
}
