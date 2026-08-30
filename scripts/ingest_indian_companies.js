const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'problems.db');
const db = new Database(dbPath);

console.log('Connecting to database:', dbPath);

// Ensure columns exist in problems table
const tableInfo = db.prepare('PRAGMA table_info(problems)').all();
const hasTrack = tableInfo.some((c) => c.name === 'hiring_track');
const hasPlatform = tableInfo.some((c) => c.name === 'platform');

if (!hasTrack) {
  console.log('Adding hiring_track column to problems table...');
  db.prepare('ALTER TABLE problems ADD COLUMN hiring_track TEXT').run();
}
if (!hasPlatform) {
  console.log('Adding platform column to problems table...');
  db.prepare('ALTER TABLE problems ADD COLUMN platform TEXT DEFAULT "LeetCode"').run();
}

const indianCompaniesData = [
  {
    company: 'Infosys',
    hiring_tracks: ['Specialist Programmer (SP)', 'Digital Specialist Engineer (DSE)'],
    questions: [
      { title: 'Two Sum', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/check-if-pair-with-given-sum-exists-in-array/', track: 'Digital Specialist Engineer (DSE)', topics: 'Array, Hash Table, Two Pointers', frequency: 95.0, acceptance: 0.52 },
      { title: 'Binary Search', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/binary-search/', track: 'Digital Specialist Engineer (DSE)', topics: 'Array, Binary Search', frequency: 92.0, acceptance: 0.58 },
      { title: 'Longest Common Prefix', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/longest-common-prefix/', track: 'Digital Specialist Engineer (DSE)', topics: 'String, Trie', frequency: 89.5, acceptance: 0.44 },
      { title: 'Valid Parentheses', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/check-for-balanced-parentheses-in-an-expression/', track: 'Digital Specialist Engineer (DSE)', topics: 'String, Stack', frequency: 91.0, acceptance: 0.41 },
      { title: 'Subarray with Given Sum', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/find-subarray-with-given-sum/', track: 'Specialist Programmer (SP)', topics: 'Array, Sliding Window, Prefix Sum', frequency: 94.0, acceptance: 0.38 },
      { title: "Kadane's Algorithm (Maximum Subarray Sum)", difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/largest-sum-contiguous-subarray/', track: 'Specialist Programmer (SP)', topics: 'Array, Dynamic Programming', frequency: 98.0, acceptance: 0.51 },
      { title: 'Minimum Platforms', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/minimum-number-platforms-required-railwaybus-station/', track: 'Specialist Programmer (SP)', topics: 'Array, Greedy, Sorting', frequency: 88.0, acceptance: 0.35 },
      { title: 'Group Anagrams', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/given-a-sequence-of-words-print-all-anagrams-together/', track: 'Specialist Programmer (SP)', topics: 'Array, Hash Table, String, Sorting', frequency: 86.5, acceptance: 0.68 },
      { title: 'Lowest Common Ancestor', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/lowest-common-ancestor-binary-tree-set-1/', track: 'Specialist Programmer (SP)', topics: 'Tree, Binary Search Tree, Depth-First Search', frequency: 87.0, acceptance: 0.62 },
      { title: '0/1 Knapsack Problem', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/0-1-knapsack-problem-dp-10/', track: 'Specialist Programmer (SP)', topics: 'Dynamic Programming', frequency: 92.5, acceptance: 0.28 },
      { title: 'Trapping Rain Water', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/trapping-rain-water/', track: 'Specialist Programmer (SP)', topics: 'Array, Two Pointers, Dynamic Programming, Stack', frequency: 96.0, acceptance: 0.31 },
      { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/median-of-two-sorted-arrays-of-different-sizes/', track: 'Specialist Programmer (SP)', topics: 'Array, Binary Search, Divide and Conquer', frequency: 90.0, acceptance: 0.22 }
    ]
  },
  {
    company: 'TCS',
    hiring_tracks: ['TCS Ninja', 'TCS Digital', 'TCS Prime'],
    questions: [
      { title: 'Roman to Integer', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/roman-number-to-integer/', track: 'TCS Ninja', topics: 'Hash Table, Math, String', frequency: 94.0, acceptance: 0.61 },
      { title: 'Reverse Linked List', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/reverse-a-linked-list/', track: 'TCS Ninja', topics: 'Linked List, Recursion', frequency: 96.0, acceptance: 0.75 },
      { title: 'Maximum Subarray', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/largest-sum-contiguous-subarray/', track: 'TCS Ninja', topics: 'Array, Dynamic Programming', frequency: 95.0, acceptance: 0.51 },
      { title: 'Search in Rotated Sorted Array', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/search-an-element-in-a-sorted-and-pivoted-array/', track: 'TCS Ninja', topics: 'Array, Binary Search', frequency: 89.0, acceptance: 0.40 },
      { title: '3Sum', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/find-a-triplet-that-sum-to-a-given-value/', track: 'TCS Digital', topics: 'Array, Two Pointers, Sorting', frequency: 93.0, acceptance: 0.34 },
      { title: 'Number of Islands', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/find-the-number-of-islands-using-dfs/', track: 'TCS Digital', topics: 'Array, Depth-First Search, Breadth-First Search, Matrix', frequency: 92.0, acceptance: 0.58 },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/length-of-the-longest-substring-without-repeating-characters/', track: 'TCS Digital', topics: 'Hash Table, String, Sliding Window', frequency: 97.0, acceptance: 0.35 },
      { title: 'Longest Consecutive Sequence', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/longest-consecutive-subsequence/', track: 'TCS Digital', topics: 'Array, Hash Table, Union Find', frequency: 88.0, acceptance: 0.48 },
      { title: 'Trapping Rain Water', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/trapping-rain-water/', track: 'TCS Prime', topics: 'Array, Two Pointers, Dynamic Programming, Stack', frequency: 96.0, acceptance: 0.31 },
      { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/median-of-two-sorted-arrays-of-different-sizes/', track: 'TCS Prime', topics: 'Array, Binary Search, Divide and Conquer', frequency: 91.0, acceptance: 0.22 },
      { title: 'N-Queens', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/n-queen-problem-backtracking-3/', track: 'TCS Prime', topics: 'Array, Backtracking', frequency: 90.0, acceptance: 0.29 },
      { title: 'Merge K Sorted Lists', difficulty: 'Hard', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/dsa/merge-k-sorted-linked-lists/', track: 'TCS Prime', topics: 'Linked List, Divide and Conquer, Heap (Priority Queue)', frequency: 89.0, acceptance: 0.52 }
    ]
  },
  {
    company: 'Capgemini',
    hiring_tracks: ['Pseudocode round', 'Off-campus / mass hiring'],
    questions: [
      { title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/two-sum/', track: 'Pseudocode round', topics: 'Array, Hash Table', frequency: 98.0, acceptance: 0.52 },
      { title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/valid-parentheses/', track: 'Pseudocode round', topics: 'String, Stack', frequency: 94.0, acceptance: 0.41 },
      { title: 'Merge Sorted Array', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/merge-sorted-array/', track: 'Off-campus / mass hiring', topics: 'Array, Two Pointers, Sorting', frequency: 91.0, acceptance: 0.49 },
      { title: 'Move Zeroes', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/move-zeroes/', track: 'Off-campus / mass hiring', topics: 'Array, Two Pointers', frequency: 89.0, acceptance: 0.61 },
      { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', track: 'Off-campus / mass hiring', topics: 'Array, Dynamic Programming', frequency: 95.0, acceptance: 0.54 },
      { title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/reverse-linked-list/', track: 'Off-campus / mass hiring', topics: 'Linked List, Recursion', frequency: 92.0, acceptance: 0.75 },
      { title: "Maximum Subarray (Kadane's)", difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/maximum-subarray/', track: 'Off-campus / mass hiring', topics: 'Array, Divide and Conquer, Dynamic Programming', frequency: 96.0, acceptance: 0.51 },
      { title: 'Number of Islands', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/number-of-islands/', track: 'Off-campus / mass hiring', topics: 'Array, Depth-First Search, Breadth-First Search, Matrix', frequency: 90.0, acceptance: 0.58 },
      { title: 'Coin Change', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/coin-change/', track: 'Off-campus / mass hiring', topics: 'Array, Dynamic Programming, Breadth-First Search', frequency: 88.0, acceptance: 0.44 },
      { title: 'Check for Balanced Parentheses in an Expression', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1', track: 'Pseudocode round', topics: 'Stack, String', frequency: 93.0, acceptance: 0.42 },
      { title: 'Longest Common Subsequence', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1', track: 'Off-campus / mass hiring', topics: 'Dynamic Programming, String', frequency: 89.0, acceptance: 0.47 },
      { title: 'Detect Cycle in a Directed Graph', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', track: 'Off-campus / mass hiring', topics: 'Graph, Depth-First Search, Breadth-First Search', frequency: 87.0, acceptance: 0.36 }
    ]
  },
  {
    company: 'Accenture',
    hiring_tracks: ['Coding round (2 questions / 45 min)', 'Mass campus hiring'],
    questions: [
      { title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/two-sum/', track: 'Coding round (2 questions / 45 min)', topics: 'Array, Hash Table', frequency: 98.0, acceptance: 0.52 },
      { title: 'Palindrome Number', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/palindrome-number/', track: 'Coding round (2 questions / 45 min)', topics: 'Math', frequency: 96.0, acceptance: 0.55 },
      { title: 'Fizz Buzz', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/fizz-buzz/', track: 'Mass campus hiring', topics: 'Math, String, Simulation', frequency: 92.0, acceptance: 0.72 },
      { title: 'Missing Number', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/missing-number/', track: 'Mass campus hiring', topics: 'Array, Hash Table, Math, Binary Search, Bit Manipulation, Sorting', frequency: 91.0, acceptance: 0.65 },
      { title: 'Contains Duplicate', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/contains-duplicate/', track: 'Mass campus hiring', topics: 'Array, Hash Table, Sorting', frequency: 90.0, acceptance: 0.61 },
      { title: 'Flood Fill', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/flood-fill/', track: 'Coding round (2 questions / 45 min)', topics: 'Array, Depth-First Search, Breadth-First Search, Matrix', frequency: 89.0, acceptance: 0.63 },
      { title: 'House Robber', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/house-robber/', track: 'Coding round (2 questions / 45 min)', topics: 'Array, Dynamic Programming', frequency: 88.0, acceptance: 0.50 },
      { title: 'Merge Intervals', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/merge-intervals/', track: 'Coding round (2 questions / 45 min)', topics: 'Array, Sorting', frequency: 93.0, acceptance: 0.47 },
      { title: 'Next Smaller Element to the Right (reported on-campus 2025)', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/interview-experiences/accenture-coding-questions-2023-23rd-july-on-campus-hiring/', track: 'On-campus 2025/2026', topics: 'Array, Stack, Monotonic Stack', frequency: 95.0, acceptance: 0.45 },
      { title: 'Print Pattern - Pyramid of Numbers', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/problems/pyramid-patterns/1', track: 'Mass campus hiring', topics: 'Pattern Printing, Basic Math', frequency: 94.0, acceptance: 0.70 },
      { title: 'Sorting Algorithms - Bubble, Selection, Insertion Sort', difficulty: 'Easy', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/sorting-algorithms/', track: 'Mass campus hiring', topics: 'Sorting, Array', frequency: 92.0, acceptance: 0.68 },
      { title: 'Find the Kth Smallest Element in an Unsorted Array', difficulty: 'Medium', platform: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1', track: 'Coding round (2 questions / 45 min)', topics: 'Array, Heap (Priority Queue), Quickselect, Sorting', frequency: 91.0, acceptance: 0.39 }
    ]
  }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Ingest each company's questions across 30_days and all_time timeframes
const insertStmt = db.prepare(`
  INSERT INTO problems (company, title, slug, leetcode_url, difficulty, timeframe, frequency, acceptance, topics, hiring_track, platform)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkExistingStmt = db.prepare(`
  SELECT id FROM problems WHERE LOWER(company) = LOWER(?) AND LOWER(title) = LOWER(?) AND timeframe = ?
`);

const updateStmt = db.prepare(`
  UPDATE problems 
  SET leetcode_url = ?, difficulty = ?, frequency = ?, acceptance = ?, topics = ?, hiring_track = ?, platform = ?
  WHERE id = ?
`);

let insertedCount = 0;
let updatedCount = 0;

const insertTransaction = db.transaction(() => {
  for (const compData of indianCompaniesData) {
    const compName = compData.company;

    for (const q of compData.questions) {
      const slug = slugify(q.title);
      const timeframes = ['30_days', 'all_time']; // Mark with recent recency (30_days) and all_time

      for (const tf of timeframes) {
        const existing = checkExistingStmt.get(compName, q.title, tf);

        if (existing) {
          updateStmt.run(
            q.link,
            q.difficulty,
            q.frequency,
            q.acceptance,
            q.topics,
            q.track,
            q.platform,
            existing.id
          );
          updatedCount++;
        } else {
          insertStmt.run(
            compName,
            q.title,
            slug,
            q.link,
            q.difficulty,
            tf,
            q.frequency,
            q.acceptance,
            q.topics,
            q.track,
            q.platform
          );
          insertedCount++;
        }
      }
    }
  }
});

insertTransaction();

console.log(`Ingestion completed! Inserted: ${insertedCount} rows, Updated: ${updatedCount} rows.`);

// Verify company counts
const verified = db.prepare(`
  SELECT company, COUNT(*) as total_rows, COUNT(DISTINCT slug) as distinct_qs, COUNT(DISTINCT hiring_track) as tracks
  FROM problems
  WHERE LOWER(company) IN ('infosys', 'tcs', 'capgemini', 'accenture')
  GROUP BY company
`).all();

console.log('Verified company statistics:', verified);
