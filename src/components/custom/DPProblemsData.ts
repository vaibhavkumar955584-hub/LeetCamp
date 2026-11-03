export interface DPProblem {
  id: string;
  title: string;
  url: string;
  category: 'Linear DP' | 'Knapsack' | 'Interval DP' | 'Tree DP' | 'State DP' | 'Grid DP' | 'Digit DP' | 'Bitmask DP' | 'Other';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export const categorizedDPProblems: DPProblem[] = [
  // 1. Linear DP
  { id: 'dp-l1', title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', category: 'Linear DP', difficulty: 'Easy' },
  { id: 'dp-l2', title: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', category: 'Linear DP', difficulty: 'Easy' },
  { id: 'dp-l3', title: 'Min Cost Climbing Stairs', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/', category: 'Linear DP', difficulty: 'Easy' },
  { id: 'dp-l4', title: 'Divisor Game', url: 'https://leetcode.com/problems/divisor-game/', category: 'Linear DP', difficulty: 'Easy' },
  { id: 'dp-l5', title: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l6', title: 'Unique Binary Search Trees', url: 'https://leetcode.com/problems/unique-binary-search-trees/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l7', title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l8', title: 'Perfect Squares', url: 'https://leetcode.com/problems/perfect-squares/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l9', title: 'Best Time to Buy and Sell Stock with Cooldown', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l10', title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l11', title: 'Counting Bits', url: 'https://leetcode.com/problems/counting-bits/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l12', title: 'Integer Break', url: 'https://leetcode.com/problems/integer-break/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l13', title: 'Count Numbers with Unique Digits', url: 'https://leetcode.com/problems/count-numbers-with-unique-digits/', category: 'Linear DP', difficulty: 'Medium' },
  { id: 'dp-l14', title: 'Best Time to Buy and Sell Stock III', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l15', title: 'Student Attendance Record II', url: 'https://leetcode.com/problems/student-attendance-record-ii/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l16', title: 'Decode Ways II', url: 'https://leetcode.com/problems/decode-ways-ii/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l17', title: 'Triples with Bitwise AND Equal To Zero', url: 'https://leetcode.com/problems/triples-with-bitwise-and-equal-to-zero/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l18', title: 'Maximum Profit in Job Scheduling', url: 'https://leetcode.com/problems/maximum-profit-in-job-scheduling/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l19', title: 'Minimum Number of Taps to Open to Water a Garden', url: 'https://leetcode.com/problems/minimum-number-of-taps-to-open-to-water-a-garden/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l20', title: 'Count All Valid Pickup and Delivery Options', url: 'https://leetcode.com/problems/count-all-valid-pickup-and-delivery-options/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l21', title: 'Stone Game III', url: 'https://leetcode.com/problems/stone-game-iii/', category: 'Linear DP', difficulty: 'Hard' },
  { id: 'dp-l22', title: 'Restore The Array', url: 'https://leetcode.com/problems/restore-the-array/', category: 'Linear DP', difficulty: 'Hard' },

  // 2. Knapsack
  { id: 'dp-k1', title: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k2', title: 'Ones and Zeroes', url: 'https://leetcode.com/problems/ones-and-zeroes/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k3', title: 'Target Sum', url: 'https://leetcode.com/problems/target-sum/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k4', title: 'Shopping Offers', url: 'https://leetcode.com/problems/shopping-offers/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k5', title: '2 Keys Keyboard', url: 'https://leetcode.com/problems/2-keys-keyboard/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k6', title: 'Minimum Swaps to Make Sequences Increasing', url: 'https://leetcode.com/problems/minimum-swaps-to-make-sequences-increasing/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k7', title: 'Best Team With No Conflicts', url: 'https://leetcode.com/problems/best-team-with-no-conflicts/', category: 'Knapsack', difficulty: 'Medium' },
  { id: 'dp-k8', title: 'Profitable Schemes', url: 'https://leetcode.com/problems/profitable-schemes/', category: 'Knapsack', difficulty: 'Hard' },
  { id: 'dp-k9', title: 'Tallest Billboard', url: 'https://leetcode.com/problems/tallest-billboard/', category: 'Knapsack', difficulty: 'Hard' },
  { id: 'dp-k10', title: 'Pizza With 3n Slices', url: 'https://leetcode.com/problems/pizza-with-3n-slices/', category: 'Knapsack', difficulty: 'Hard' },

  // 3. Interval DP
  { id: 'dp-i1', title: 'Burst Balloons', url: 'https://leetcode.com/problems/burst-balloons/', category: 'Interval DP', difficulty: 'Hard' },
  { id: 'dp-i2', title: 'Remove Boxes', url: 'https://leetcode.com/problems/remove-boxes/', category: 'Interval DP', difficulty: 'Hard' },
  { id: 'dp-i3', title: 'Strange Printer', url: 'https://leetcode.com/problems/strange-printer/', category: 'Interval DP', difficulty: 'Hard' },
  { id: 'dp-i4', title: 'Palindrome Removal', url: 'https://leetcode.com/problems/palindrome-removal/', category: 'Interval DP', difficulty: 'Hard' },

  // 4. Tree DP
  { id: 'dp-t1', title: 'House Robber III', url: 'https://leetcode.com/problems/house-robber-iii/', category: 'Tree DP', difficulty: 'Medium' },
  { id: 'dp-t2', title: 'Unique Binary Search Trees II', url: 'https://leetcode.com/problems/unique-binary-search-trees-ii/', category: 'Tree DP', difficulty: 'Medium' },
  { id: 'dp-t3', title: 'Knight Probability in Chessboard', url: 'https://leetcode.com/problems/knight-probability-in-chessboard/', category: 'Tree DP', difficulty: 'Medium' },
  { id: 'dp-t4', title: 'Redundant Connection II', url: 'https://leetcode.com/problems/redundant-connection-ii/', category: 'Tree DP', difficulty: 'Hard' },
  { id: 'dp-t5', title: 'Number of Ways to Reconstruct a Tree', url: 'https://leetcode.com/problems/number-of-ways-to-reconstruct-a-tree/', category: 'Tree DP', difficulty: 'Hard' },
  { id: 'dp-t6', title: 'Tree Coloring', url: 'https://leetcode.com/problems/tree-coloring/', category: 'Tree DP', difficulty: 'Hard' },

  // 5. State DP
  { id: 'dp-s1', title: 'Combination Sum IV', url: 'https://leetcode.com/problems/combination-sum-iv/', category: 'State DP', difficulty: 'Medium' },
  { id: 'dp-s2', title: 'Out of Boundary Paths', url: 'https://leetcode.com/problems/out-of-boundary-paths/', category: 'State DP', difficulty: 'Medium' },
  { id: 'dp-s3', title: 'Domino and Tromino Tiling', url: 'https://leetcode.com/problems/domino-and-tromino-tiling/', category: 'State DP', difficulty: 'Medium' },
  { id: 'dp-s4', title: 'Number of Ways to Form a Target String Given a Dictionary', url: 'https://leetcode.com/problems/number-of-ways-to-form-a-target-string-given-a-dictionary/', category: 'State DP', difficulty: 'Hard' },
  { id: 'dp-s5', title: 'Build Array Where You Can Find The Maximum Exactly K Comparisons', url: 'https://leetcode.com/problems/build-array-where-you-can-find-the-maximum-exactly-k-comparisons/', category: 'State DP', difficulty: 'Hard' },
  { id: 'dp-s6', title: 'Number of Ways of Cutting a Pizza', url: 'https://leetcode.com/problems/number-of-ways-of-cutting-a-pizza/', category: 'State DP', difficulty: 'Hard' },
  { id: 'dp-s7', title: 'Paint House III', url: 'https://leetcode.com/problems/paint-house-iii/', category: 'State DP', difficulty: 'Hard' },
];
