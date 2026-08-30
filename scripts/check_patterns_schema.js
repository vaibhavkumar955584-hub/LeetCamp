const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const dir = path.join(__dirname, '../data/patterns');
if (!fs.existsSync(dir)) {
  console.log('No dir');
  process.exit(0);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
console.log(`Found ${files.length} CSV files in ${dir}`);

const columnSets = new Map();
let totalRows = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    totalRows += records.length;
    if (records.length > 0) {
      const cols = Object.keys(records[0]).sort().join(', ');
      columnSets.set(cols, (columnSets.get(cols) || 0) + 1);
    }
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}

console.log('Total pattern problem rows:', totalRows);
console.log('Column structures across files:');
for (const [cols, count] of columnSets.entries()) {
  console.log(`- [${count} files]: ${cols}`);
}
