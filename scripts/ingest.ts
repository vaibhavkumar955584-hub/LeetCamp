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
  if (clean === 'easy') return 'Easy';
  if (clean === 'medium') return 'Medium';
  if (clean === 'hard') return 'Hard';
  return raw.trim() || 'Medium';
}

// Slugify fallback
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Extract slug and URL
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
    url: `https://leetcode.com/problems/${slug}/`,
    fallback: true,
  };
}

export function runIngestion(datasetPath: string, dbPath: string = 'data/problems.db') {
  const resolvedDatasetPath = path.resolve(datasetPath);
  if (!fs.existsSync(resolvedDatasetPath)) {
    console.error(`Error: Dataset directory not found at: ${resolvedDatasetPath}`);
    process.exit(1);
  }

  const resolvedDbPath = path.resolve(dbPath);
  const dbDir = path.dirname(resolvedDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Remove existing DB file if clean re-ingestion
  if (fs.existsSync(resolvedDbPath)) {
    try {
      fs.unlinkSync(resolvedDbPath);
    } catch (e) {
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

    CREATE TABLE _metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_problems_company ON problems(company);
    CREATE INDEX IF NOT EXISTS idx_problems_company_difficulty ON problems(company, difficulty);
    CREATE INDEX IF NOT EXISTS idx_problems_company_timeframe ON problems(company, timeframe);
    CREATE INDEX IF NOT EXISTS idx_problems_company_title ON problems(company, title);
  `);

  const insertStmt = db.prepare(`
    INSERT INTO problems (company, title, slug, leetcode_url, difficulty, timeframe, frequency, acceptance, topics)
    VALUES (@company, @title, @slug, @leetcode_url, @difficulty, @timeframe, @frequency, @acceptance, @topics)
  `);

  const insertMany = db.transaction((rows: any[]) => {
    for (const row of rows) {
      insertStmt.run(row);
    }
  });

  const entries = fs.readdirSync(resolvedDatasetPath, { withFileTypes: true });
  const companyDirs = entries.filter((e) => e.isDirectory() && e.name !== '.git').sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Found ${companyDirs.length} company folders to process...`);

  const companyStats: { company: string; count: number }[] = [];
  let totalRowsIngested = 0;
  let fallbackCount = 0;

  for (const dir of companyDirs) {
    const company = dir.name;
    const companyPath = path.join(resolvedDatasetPath, company);
    const files = fs.readdirSync(companyPath).filter((f) => f.endsWith('.csv')).sort();

    const companyRows: any[] = [];

    for (const file of files) {
      const timeframe = getTimeframeFromFilename(file);
      if (!timeframe) {
        console.warn(`[WARNING] Unrecognized timeframe file '${file}' in company '${company}', skipping.`);
        continue;
      }

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
      } catch (err: any) {
        console.error(`[ERROR] Failed to parse CSV: ${filePath} - ${err.message}`);
        continue;
      }

      for (const record of records) {
        // Defensive column lookup
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
        const { slug, url, fallback } = deriveSlugAndUrl(rawLink, title);
        if (fallback) {
          fallbackCount++;
          console.warn(`[FALLBACK SLUG] Slugified '${title}' -> '${slug}' for company '${company}'`);
        }

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
      insertMany(companyRows);
      totalRowsIngested += companyRows.length;
      companyStats.push({ company, count: companyRows.length });
    } else {
      companyStats.push({ company, count: 0 });
    }
  }

  // Record ingestion metadata
  const insertMeta = db.prepare('INSERT OR REPLACE INTO _metadata (key, value) VALUES (?, ?)');
  insertMeta.run('last_ingested_at', new Date().toISOString());
  insertMeta.run('total_rows', totalRowsIngested.toString());
  insertMeta.run('total_companies', companyDirs.length.toString());

  // Print Summary
  console.log('\n================ PER-COMPANY ROW COUNTS ================');
  for (const stat of companyStats) {
    console.log(`${stat.company}: ${stat.count} rows`);
  }
  console.log('========================================================\n');
  console.log(`Summary Statistics:`);
  console.log(`- Total Companies Processed: ${companyDirs.length}`);
  console.log(`- Total Active Companies with Questions: ${companyStats.filter(c => c.count > 0).length}`);
  console.log(`- Total Problems Ingested: ${totalRowsIngested}`);
  console.log(`- Total Fallback Slugs: ${fallbackCount}`);
  console.log(`- Database saved at: ${resolvedDbPath}\n`);

  db.close();
  return { totalCompanies: companyDirs.length, totalRows: totalRowsIngested, companyStats };
}

// CLI entry point
if (require.main === module || process.argv[1]?.endsWith('ingest.ts') || process.argv[1]?.endsWith('ingest.js')) {
  const datasetPathArg = process.argv[2] || process.env.DATASET_PATH || 'data/leetcode-company-wise-problems';
  console.log(`Starting ingestion from: ${datasetPathArg}`);
  runIngestion(datasetPathArg);
}
