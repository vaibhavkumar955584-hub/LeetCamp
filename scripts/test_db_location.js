const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function isWritable(dir) {
  try {
    const testFile = path.join(dir, `.test_${Date.now()}`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
}

function findDbPath() {
  let sourceDbPath = path.join(process.cwd(), 'data', 'problems.db');
  if (!fs.existsSync(sourceDbPath)) {
    const candidates = [
      path.resolve(process.cwd(), 'data', 'problems.db'),
      path.join(__dirname, '..', 'data', 'problems.db'),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        sourceDbPath = cand;
        break;
      }
    }
  }
  return sourceDbPath;
}

const source = findDbPath();
console.log('Found source DB:', source, 'exists:', fs.existsSync(source), 'size:', fs.statSync(source).size);

const db = new Database(source, { readonly: false, fileMustExist: true });
const count = db.prepare('SELECT COUNT(*) as c FROM problems').get();
const patternCount = db.prepare('SELECT COUNT(*) as c FROM pattern_problems').get();
console.log('Company problems count:', count.c);
console.log('Pattern problems count:', patternCount.c);
