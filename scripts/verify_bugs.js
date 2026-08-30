const Database = require('better-sqlite3');
const db = new Database('data/problems.db');

console.log('=== BUG 1: COUNT INVESTIGATION ===');
const totalRows = db.prepare('SELECT COUNT(*) as c FROM problems').get().c;
const distinctCompanySlug = db.prepare("SELECT COUNT(DISTINCT company || '::' || slug) as c FROM problems").get().c;
const distinctSlug = db.prepare('SELECT COUNT(DISTINCT slug) as c FROM problems').get().c;
const distinctCompany = db.prepare('SELECT COUNT(DISTINCT company) as c FROM problems').get().c;
const totalPatternRows = db.prepare('SELECT COUNT(*) as c FROM pattern_problems').get().c;
const distinctPatternCategories = db.prepare('SELECT COUNT(DISTINCT category) as c FROM pattern_problems').get().c;

console.log('1. Raw rows in problems table (all timeframes):', totalRows);
console.log('2. Distinct (company, problem) pairs:', distinctCompanySlug);
console.log('3. Distinct unique LeetCode problems (slugs across all companies):', distinctSlug);
console.log('4. Distinct companies in problems table:', distinctCompany);
console.log('5. Raw rows in pattern_problems table:', totalPatternRows);
console.log('6. Distinct pattern categories:', distinctPatternCategories);

console.log('\n=== BUG 2: COMPANIES ENDING IN A DIGIT ===');
const digitCompanies = db.prepare('SELECT DISTINCT company FROM problems ORDER BY company').all()
  .map(r => r.company)
  .filter(name => /[0-9]$/.test(name));
console.log(`Companies ending in digit (${digitCompanies.length} found):`, digitCompanies);

console.log('\n=== BUG 4: DIFFICULTIES IN PROBLEMS VS PATTERN_PROBLEMS ===');
const probDiffs = db.prepare('SELECT difficulty, COUNT(*) as c FROM problems GROUP BY difficulty').all();
console.log('Difficulties in problems table:', probDiffs);
const patDiffs = db.prepare('SELECT difficulty, COUNT(*) as c FROM pattern_problems GROUP BY difficulty').all();
console.log('Difficulties in pattern_problems table:', patDiffs);

console.log('\n=== BUG 5: CASING VARIANTS CHECK ===');
const casingDuplicates = db.prepare('SELECT LOWER(company) as low, COUNT(DISTINCT company) as cnt, GROUP_CONCAT(DISTINCT company) as variants FROM problems GROUP BY LOWER(company) HAVING cnt > 1').all();
console.log(`Companies with multiple casing variants (${casingDuplicates.length} found):`, casingDuplicates);

const allCompanies = db.prepare('SELECT DISTINCT company FROM problems ORDER BY company').all().map(r => r.company);
console.log('\nSample Company casings (first 30):', allCompanies.slice(0, 30));
