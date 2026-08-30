const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dir = path.join(__dirname, '..', 'data', 'dsa_patterns_drive');
const dbPath = path.join(__dirname, '..', 'data', 'problems.db');
const db = new Database(dbPath);

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.csv'));
console.log(`Found ${files.length} CSV files in ${dir}`);

// Inspect headers and sample rows
let totalCsvRows = 0;
const fileStats = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0];
  const rowCount = lines.length - 1;
  totalCsvRows += Math.max(0, rowCount);

  fileStats.push({
    file,
    header,
    rowCount,
    sample: lines[1] || ''
  });
}

console.log(`Total CSV rows across all 48 files: ${totalCsvRows}`);
console.log('Sample file headers & structure:');
console.log(fileStats.slice(0, 5));

// Check database counts
const patternCount = db.prepare('SELECT COUNT(*) as c, COUNT(DISTINCT category) as cats, COUNT(DISTINCT title) as distinct_titles FROM pattern_problems').get();
console.log('Database pattern_problems table stats:', patternCount);
