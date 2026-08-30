const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dir = path.join(__dirname, '..', 'data', 'dsa_patterns_drive');
const dbPath = path.join(__dirname, '..', 'data', 'problems.db');
const db = new Database(dbPath);

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.csv'));

function parseCsvLine(text) {
  const result = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += c;
    }
  }
  result.push(curr.trim());
  return result;
}

let matched = 0;
let missingInDb = 0;
const missingList = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;
    const category = cols[0];
    const difficulty = cols[1];
    const title = cols[2];
    const companyTags = cols[3] || '';
    const accuracyStr = cols[4] || '';
    const url = cols[5] || '';

    const row = db.prepare('SELECT * FROM pattern_problems WHERE category = ? AND title = ?').get(category, title);
    if (row) {
      matched++;
    } else {
      missingInDb++;
      missingList.push({ file, category, title, url });
    }
  }
}

console.log(`Parity Check Result: Matched = ${matched}, Missing = ${missingInDb}`);
if (missingList.length > 0) {
  console.log('Missing items:', missingList);
}

// Let's also check company cross-referencing stats
const companyTagsCheck = db.prepare(`
  SELECT 
    COUNT(*) as total_with_company_tags,
    COUNT(CASE WHEN company_tags LIKE '%Infosys%' THEN 1 END) as infosys_tags,
    COUNT(CASE WHEN company_tags LIKE '%TCS%' THEN 1 END) as tcs_tags,
    COUNT(CASE WHEN company_tags LIKE '%Amazon%' THEN 1 END) as amazon_tags,
    COUNT(CASE WHEN company_tags LIKE '%Microsoft%' THEN 1 END) as msft_tags,
    COUNT(CASE WHEN company_tags LIKE '%Google%' THEN 1 END) as google_tags
  FROM pattern_problems
  WHERE company_tags IS NOT NULL AND company_tags != ''
`).get();

console.log('Company tagging cross-reference stats in pattern_problems:', companyTagsCheck);
