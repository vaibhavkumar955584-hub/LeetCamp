const fs = require('fs');

const content = fs.readFileSync('C:/Users/vaibh/.gemini/antigravity-ide/brain/54f7b6e9-fa4d-44e1-baed-dc894cce36b3/.system_generated/steps/21/content.md', 'utf8');

// In Google Drive HTML, entries usually look like: ["fileId","FileName.csv", ...] or similar
// Let's search around ".csv" in content
const csvMatches = [];
const regex = /\["([a-zA-Z0-9_\-]{25,})"[^\]]*?"([^"]+?\.csv)"/g;
let m;
while ((m = regex.exec(content)) !== null) {
  csvMatches.push({ id: m[1], name: m[2] });
}

console.log('Found with regex 1:', csvMatches.length);
if (csvMatches.length > 0) {
  console.log(csvMatches.slice(0, 5));
}

// Let's try another pattern: "([^"]+?\.csv)"[\s\S]{0,100}?"([a-zA-Z0-9_\-]{25,})" or vice versa
const entries = [];
const allCsvPos = [];
let pos = 0;
while ((pos = content.indexOf('.csv', pos)) !== -1) {
  // grab snippet around pos
  const start = Math.max(0, pos - 150);
  const end = Math.min(content.length, pos + 150);
  const snippet = content.substring(start, end);
  // find id
  const idMatches = snippet.match(/[a-zA-Z0-9_\-]{28,35}/g);
  // find name
  const nameMatch = snippet.match(/([a-zA-Z0-9_\-]+\.csv)/);
  if (nameMatch && idMatches) {
    for (const id of idMatches) {
      if (!id.includes('drive') && !id.includes('gstatic') && !id.includes('google')) {
        entries.push({ name: nameMatch[1], id, snippet });
        break;
      }
    }
  }
  pos += 4;
}

console.log('Entries found from snippets:', entries.length);
const unique = new Map();
for (const e of entries) {
  if (!unique.has(e.name)) {
    unique.set(e.name, e);
  }
}
console.log('Unique files mapped:', unique.size);
for (const [name, val] of unique.entries()) {
  console.log(`${name} -> ID: ${val.id} (snippet: ${val.snippet.replace(/\n/g, ' ')})`);
}
