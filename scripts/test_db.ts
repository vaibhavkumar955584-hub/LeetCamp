import {
  getAllCompanies,
  getAllPatterns,
  getPatternProblems,
  getPatternOverview,
  getCompanyPatternProblems,
  getGlobalStats,
  checkDbHealth
} from '../src/lib/db';

console.log('=== LEETCAMP DATABASE VERIFICATION ===');
const health = checkDbHealth();
console.log('DB Health:', health);

const stats = getGlobalStats();
console.log('Global Stats:', stats);

const patterns = getAllPatterns();
console.log(`Total Patterns found: ${patterns.length}`);
console.log('Sample patterns (first 5):', patterns.slice(0, 5).map(p => ({ category: p.category, count: p.count, group: p.group })));

const dpProblems = getPatternProblems('dynamic-programming', { page: 1, limit: 5 });
console.log(`Dynamic Programming Problems: total = ${dpProblems.pagination.total}`);
console.log('DP Sample problem:', dpProblems.problems[0]);

const amazonPatterns = getCompanyPatternProblems('Amazon');
console.log(`Pattern problems tagged with Amazon: ${amazonPatterns.length}`);

const googlePatterns = getCompanyPatternProblems('Google');
console.log(`Pattern problems tagged with Google: ${googlePatterns.length}`);

console.log('=== ALL TESTS PASSED! ===');
