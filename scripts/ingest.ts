import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { parse } from 'csv-parse/sync';

// Normalize timeframe from filename
function getTimeframeFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.includes('thirty days') || lower.includes('30 days') || lower.includes('30_days') || lower.startsWith('1.')) {
    return '30_days';
  }
  if (lower.includes('three months') || lower.includes('90 days') || lower.includes('3 months') || lower.startsWith('2.')) {
    return '90_days';
  }
  if (lower.includes('six months') && !lower.includes('more than') || lower.startsWith('3.')) {
    return '6_months';
  }
  if (lower.includes('more than six months') || lower.includes('more than 6') || lower.startsWith('4.')) {
    return 'more_than_six_months';
  }
  if (lower.includes('all') || lower.startsWith('5.')) {
    return 'all_time';
  }
  return null;
}

// Normalize difficulty
function normalizeDifficulty(raw: string): string {
  const clean = (raw || '').trim().toLowerCase();
  if (clean === 'basic' || clean === 'school') return 'Basic';
  if (clean === 'easy') return 'Easy';
  if (clean === 'medium') return 'Medium';
  if (clean === 'hard') return 'Hard';
  return raw.trim() || 'Medium';
}

// Slugify helper
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Extract slug and URL for LeetCode problems
function deriveSlugAndUrl(linkRaw: string | undefined, title: string): { slug: string; url: string; fallback: boolean } {
  const link = (linkRaw || '').trim();
  if (link && link.includes('leetcode.com/problems/')) {
    try {
      const urlObj = new URL(link);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const probIdx = parts.indexOf('problems');
      if (probIdx !== -1 && parts[probIdx + 1]) {
        const slug = parts[probIdx + 1];
        return { slug, url: `https://leetcode.com/problems/${slug}/`, fallback: false };
      }
    } catch {
      // Fallback
    }
  }

  const slug = slugify(title);
  return {
    slug,
    url: link || `https://leetcode.com/problems/${slug}/`,
    fallback: !link,
  };
}

export function runIngestion(
  datasetPath: string = 'data/leetcode-company-wise-problems',
  patternsPath: string = 'data/patterns',
  dbPath: string = 'data/problems.db'
) {
  const resolvedDatasetPath = path.resolve(datasetPath);
  const resolvedPatternsPath = path.resolve(patternsPath);
  const resolvedDbPath = path.resolve(dbPath);
  const dbDir = path.dirname(resolvedDbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Remove existing DB file if clean re-ingestion
  if (fs.existsSync(resolvedDbPath)) {
    try {
      fs.unlinkSync(resolvedDbPath);
    } catch {
      console.log('Notice: overwriting existing database');
    }
  }

  console.log(`Connecting to SQLite at: ${resolvedDbPath}`);
  const db = new Database(resolvedDbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Ensure clean table recreation for idempotent ingestion
  db.exec(`
    DROP TABLE IF EXISTS problems;
    DROP TABLE IF EXISTS pattern_problems;
    DROP TABLE IF EXISTS _metadata;

    CREATE TABLE problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      leetcode_url TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      frequency REAL,
      acceptance REAL,
      topics TEXT
    );

    CREATE TABLE pattern_problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      title TEXT NOT NULL,
      company_tags TEXT,
      accuracy REAL,
      url TEXT NOT NULL
    );

    CREATE TABLE _metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_problems_company ON problems(company);
    CREATE INDEX IF NOT EXISTS idx_problems_company_difficulty ON problems(company, difficulty);
    CREATE INDEX IF NOT EXISTS idx_problems_company_timeframe ON problems(company, timeframe);
    CREATE INDEX IF NOT EXISTS idx_problems_company_title ON problems(company, title);

    CREATE INDEX IF NOT EXISTS idx_pattern_problems_category ON pattern_problems(category_slug);
    CREATE INDEX IF NOT EXISTS idx_pattern_problems_category_raw ON pattern_problems(category);
    CREATE INDEX IF NOT EXISTS idx_pattern_problems_diff ON pattern_problems(category_slug, difficulty);
    CREATE INDEX IF NOT EXISTS idx_pattern_problems_title ON pattern_problems(title);
    CREATE INDEX IF NOT EXISTS idx_pattern_problems_company_tags ON pattern_problems(company_tags);
  `);

  let totalCompanyRows = 0;
  let totalCompanyDirs = 0;

  // 1. Ingest Company-Wise Problems
  if (fs.existsSync(resolvedDatasetPath)) {
    console.log(`Ingesting company problems from: ${resolvedDatasetPath}`);
    const insertProblemStmt = db.prepare(`
      INSERT INTO problems (company, title, slug, leetcode_url, difficulty, timeframe, frequency, acceptance, topics)
      VALUES (@company, @title, @slug, @leetcode_url, @difficulty, @timeframe, @frequency, @acceptance, @topics)
    `);

    const insertManyProblems = db.transaction((rows: any[]) => {
      for (const row of rows) {
        insertProblemStmt.run(row);
      }
    });

    const entries = fs.readdirSync(resolvedDatasetPath, { withFileTypes: true });
    const companyDirs = entries.filter((e) => e.isDirectory() && e.name !== '.git').sort((a, b) => a.name.localeCompare(b.name));
    totalCompanyDirs = companyDirs.length;

    console.log(`Found ${companyDirs.length} company folders to process...`);
    const companyStats: { company: string; count: number }[] = [];

    for (const dir of companyDirs) {
      const company = dir.name;
      const companyPath = path.join(resolvedDatasetPath, company);
      const files = fs.readdirSync(companyPath).filter((f) => f.endsWith('.csv')).sort();

      const companyRows: any[] = [];

      for (const file of files) {
        const timeframe = getTimeframeFromFilename(file);
        if (!timeframe) continue;

        const filePath = path.join(companyPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content.trim()) continue;

        let records: Record<string, string>[] = [];
        try {
          records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
          });
        } catch {
          continue;
        }

        for (const record of records) {
          const keys = Object.keys(record);
          const findKey = (name: string) => keys.find((k) => k.toLowerCase().replace(/[^a-z]/g, '') === name.toLowerCase().replace(/[^a-z]/g, ''));

          const diffKey = findKey('difficulty');
          const titleKey = findKey('title');
          const freqKey = findKey('frequency');
          const acceptKey = findKey('acceptancerate') || findKey('acceptance');
          const linkKey = findKey('link') || findKey('url') || findKey('leetcodeurl');
          const topicsKey = findKey('topics') || findKey('topictags') || findKey('tags');

          const title = (titleKey && record[titleKey]) ? record[titleKey].trim() : '';
          if (!title) continue;

          const rawDifficulty = diffKey && record[diffKey] ? record[diffKey] : 'Medium';
          const difficulty = normalizeDifficulty(rawDifficulty);

          const rawFreq = freqKey && record[freqKey] ? parseFloat(record[freqKey]) : null;
          const frequency = isNaN(rawFreq as number) ? null : rawFreq;

          const rawAccept = acceptKey && record[acceptKey] ? parseFloat(record[acceptKey]) : null;
          const acceptance = isNaN(rawAccept as number) ? null : rawAccept;

          const rawLink = linkKey && record[linkKey] ? record[linkKey] : '';
          const { slug, url } = deriveSlugAndUrl(rawLink, title);

          const topics = topicsKey && record[topicsKey] ? record[topicsKey].trim() : null;

          companyRows.push({
            company,
            title,
            slug,
            leetcode_url: url,
            difficulty,
            timeframe,
            frequency,
            acceptance,
            topics,
          });
        }
      }

      if (companyRows.length > 0) {
        insertManyProblems(companyRows);
        totalCompanyRows += companyRows.length;
        companyStats.push({ company, count: companyRows.length });
      }
    }
  }

  // 2. Ingest DSA Pattern Problems
  let totalPatternProblems = 0;
  let totalPatternCategories = 0;

  if (fs.existsSync(resolvedPatternsPath)) {
    console.log(`Ingesting DSA patterns from: ${resolvedPatternsPath}`);
    const insertPatternStmt = db.prepare(`
      INSERT INTO pattern_problems (category, category_slug, difficulty, title, company_tags, accuracy, url)
      VALUES (@category, @category_slug, @difficulty, @title, @company_tags, @accuracy, @url)
    `);

    const insertManyPatterns = db.transaction((rows: any[]) => {
      for (const row of rows) {
        insertPatternStmt.run(row);
      }
    });

    const patternFiles = fs.readdirSync(resolvedPatternsPath).filter((f) => f.endsWith('.csv')).sort();
    const patternCategoriesSet = new Set<string>();

    for (const file of patternFiles) {
      const filePath = path.join(resolvedPatternsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content.trim()) continue;

      let records: Record<string, string>[] = [];
      try {
        records = parse(content, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        });
      } catch (err: any) {
        console.error(`Error parsing pattern CSV ${file}:`, err.message);
        continue;
      }

      const patternRows: any[] = [];
      const fallbackCategory = path.basename(file, '.csv').replace(/_/g, ' ');

      for (const record of records) {
        const title = (record.title || '').trim();
        if (!title) continue;

        const category = (record.category || fallbackCategory).trim();
        const categorySlug = slugify(category);
        patternCategoriesSet.add(category);

        const difficulty = normalizeDifficulty(record.difficulty || 'Medium');
        const companyTags = (record.company_tags || '').trim() || null;
        
        let accuracy: number | null = null;
        if (record.accuracy) {
          const cleanAcc = record.accuracy.replace('%', '').trim();
          const parsedAcc = parseFloat(cleanAcc);
          if (!isNaN(parsedAcc)) {
            accuracy = parsedAcc;
          }
        }

        const url = (record.url || '').trim() || `https://www.google.com/search?q=${encodeURIComponent(title + ' DSA problem')}`;

        patternRows.push({
          category,
          category_slug: categorySlug,
          difficulty,
          title,
          company_tags: companyTags,
          accuracy,
          url,
        });
      }

      if (patternRows.length > 0) {
        insertManyPatterns(patternRows);
        totalPatternProblems += patternRows.length;
      }
    }

    totalPatternCategories = patternCategoriesSet.size;
    console.log(`Ingested ${totalPatternProblems} problems across ${totalPatternCategories} DSA patterns.`);
  }

  // Record ingestion metadata
  const insertMeta = db.prepare('INSERT OR REPLACE INTO _metadata (key, value) VALUES (?, ?)');
  insertMeta.run('last_ingested_at', new Date().toISOString());
  insertMeta.run('total_rows', totalCompanyRows.toString());
  insertMeta.run('total_companies', totalCompanyDirs.toString());
  insertMeta.run('total_pattern_problems', totalPatternProblems.toString());
  insertMeta.run('total_patterns', totalPatternCategories.toString());

  console.log('\n================ INGESTION SUMMARY ================');
  console.log(`- Total Companies Processed: ${totalCompanyDirs}`);
  console.log(`- Total Company Problems: ${totalCompanyRows}`);
  console.log(`- Total DSA Patterns: ${totalPatternCategories}`);
  console.log(`- Total DSA Pattern Problems: ${totalPatternProblems}`);
  console.log(`- Database saved at: ${resolvedDbPath}\n`);

  db.close();
  return {
    totalCompanies: totalCompanyDirs,
    totalRows: totalCompanyRows,
    totalPatterns: totalPatternCategories,
    totalPatternProblems,
  };
}

// CLI entry point
if (require.main === module || process.argv[1]?.endsWith('ingest.ts') || process.argv[1]?.endsWith('ingest.js')) {
  const datasetPathArg = process.argv[2] || process.env.DATASET_PATH || 'data/leetcode-company-wise-problems';
  const patternsPathArg = process.argv[3] || process.env.PATTERNS_PATH || 'data/patterns';
  console.log(`Starting ingestion from: ${datasetPathArg} and ${patternsPathArg}`);
  runIngestion(datasetPathArg, patternsPathArg);
}
