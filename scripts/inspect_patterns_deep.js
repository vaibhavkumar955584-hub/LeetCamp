const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const dir = path.join(__dirname, '../data/patterns');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));

const categories = new Set();
const difficulties = new Set();
const allCompanies = new Set();
let sampleRows = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  for (const r of records) {
    if (r.category) categories.add(r.category);
    if (r.difficulty) difficulties.add(r.difficulty);
    if (r.company_tags) {
      r.company_tags.split(',').forEach(c => {
        const clean = c.replace(/\+\d+/, '').trim();
        if (clean) allCompanies.add(clean);
      });
    }
    if (sampleRows.length < 5) {
      sampleRows.push({ ...r, file });
    }
  }
}

console.log('Categories found:', Array.from(categories).sort());
console.log('Difficulties found:', Array.from(difficulties));
console.log('Unique company tags found in patterns:', allCompanies.size);
console.log('Sample company tags:', Array.from(allCompanies).slice(0, 20));
console.log('Sample pattern rows:', JSON.stringify(sampleRows, null, 2));
