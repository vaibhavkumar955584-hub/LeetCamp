const fs = require('fs');
const path = require('path');
const https = require('https');

const content = fs.readFileSync('C:/Users/vaibh/.gemini/antigravity-ide/brain/54f7b6e9-fa4d-44e1-baed-dc894cce36b3/.system_generated/steps/21/content.md', 'utf8');

// The pattern in Google drive JS is:
// ["<FILE_ID>",["1qz-12NBkHE4IQ3sYt2DYCWb9fDIYBniN"],"<FILENAME>"
// Note that escaped quotes might appear as \" or \x22
const regex = /(?:\\x22|")([a-zA-Z0-9_\-]{25,36})(?:\\x22|")[^\]]*?(?:\\x22|")1qz-12NBkHE4IQ3sYt2DYCWb9fDIYBniN(?:\\x22|")[^\]]*?(?:\\x22|")([^"\\]+\.csv)(?:\\x22|")/g;

const foundFiles = [];
let match;
while ((match = regex.exec(content)) !== null) {
  foundFiles.push({ id: match[1], name: match[2] });
}

console.log(`Extracted ${foundFiles.length} files with regex.`);

// Fallback search if needed
if (foundFiles.length === 0) {
  // Broad search
  const regex2 = /(?:\\x22|")([a-zA-Z0-9_\-]{25,36})(?:\\x22|"),\[(?:\\x22|")1qz-12NBkHE4IQ3sYt2DYCWb9fDIYBniN(?:\\x22|")\],(?:\\x22|")([^"\\]+\.csv)(?:\\x22|")/g;
  while ((match = regex2.exec(content)) !== null) {
    foundFiles.push({ id: match[1], name: match[2] });
  }
}

// Deduplicate
const fileMap = new Map();
for (const f of foundFiles) {
  fileMap.set(f.name, f.id);
}

console.log(`Unique files count: ${fileMap.size}`);
for (const [name, id] of fileMap.entries()) {
  console.log(`- ${name}: ${id}`);
}

// Save the list
fs.writeFileSync('data/patterns_file_list.json', JSON.stringify(Object.fromEntries(fileMap), null, 2));
