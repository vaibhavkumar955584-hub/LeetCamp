# LeetCamp

### Company-wise LeetCode & DSA Pattern Interview Question Explorer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20LeetCamp-black?style=for-the-badge)](https://leetcamp.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/vaibhavkumar955584-hub/LeetCamp)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-black?style=flat-square&logo=sqlite)](https://www.sqlite.org/)

**Prepare smarter. Target the company or master the pattern. Practice the problems that matter.**

[Visit LeetCamp](https://leetcamp.onrender.com/) · [View Source](https://github.com/vaibhavkumar955584-hub/LeetCamp)

---

## What is LeetCamp?

LeetCamp is a company-wise and pattern-wise interview preparation platform that helps developers explore **LeetCode & DSA problems reported in technical interviews**.

Instead of randomly solving hundreds of problems, you can select the company you're targeting or the structural DSA pattern you want to master, using filters such as:

- **Target Organization** (470+ tech companies)
- **DSA Pattern Roadmap** (48 structured algorithm & data structure patterns)
- **Timeframe** (30d, 90d, 6m, all-time)
- **Difficulty** (Basic, Easy, Medium, Hard)
- **Topic Tags & Corporate Cross-References**
- **Frequency & Accuracy Scores**
- **Local Progress Tracking** (Check off solved problems with browser persistence)

The goal is simple:

> **Turn interview preparation from a broad search into a focused, systematic plan.**

---

## Features

- **470+ Company Directories**: Explore categorized interview question banks across top tech companies (Google, Amazon, Meta, Microsoft, Apple, Bloomberg, and more).
- **48 DSA Pattern Roadmaps & Topic Collections**: 2,961+ curated problems across 48 fundamental and advanced data structures and algorithm patterns (Arrays, Strings, Trees, Graphs, Dynamic Programming, Sliding Window, Two Pointers, Tries, Segment Trees, Backtracking, Bit Magic, etc.).
- **Fast SQLite Engine**: 40,600+ total indexed records powered by `better-sqlite3` in WAL mode for sub-millisecond query responses.
- **Local Progress Tracking**: Mark questions as Solved with instant localStorage persistence, CRT progress meters, and solved counters.
- **Recency Timeframe Filtering**:
  - `30 Days` (Recent interview trends)
  - `90 Days` (Quarterly)
  - `6 Months` (Semi-annual)
  - `More than 6 Months`
  - `All-Time`
- **Multi-Select Difficulty**: Real-time filtering by Basic, Easy, Medium, and Hard.
- **Company Cross-Tags**: Pattern questions tagged with corporate interview references (e.g. Amazon, Google, Microsoft, Adobe).
- **Topic Tags and Text Search**: Server-side SQL search across problem titles, companies, and pattern categories.
- **Dynamic Sorting**: Sort questions by Frequency Score, Acceptance Rate, Accuracy %, Difficulty, and Problem Title.
- **Direct Official Links**: Direct links to official LeetCode and problem URLs.
- **CRT Phosphor Terminal Aesthetic**: High-contrast, responsive terminal-inspired UI with scanline styling and monospace typography.

---

## Why I Built This

While preparing for technical interviews, two key questions kept coming up:

1. **"What should I actually practice for the company I'm targeting?"**
2. **"How do I practice questions by underlying algorithmic patterns rather than random lists?"**

LeetCamp makes both processes effortless in one unified terminal interface.

---

## Explore the App

### 1. Company Directory
Explore interview question collections across **470+ companies**. Choose a company and get a dedicated problem explorer with frequency rankings, recency windows (30d, 90d, 6m, all-time), and corporate pattern cross-references.

### 2. DSA Patterns & Topic Roadmaps
Explore **48 DSA Patterns** structured across 6 Roadmap Pillars:
1. *Core Data Structures* (Arrays, Strings, Linked Lists, Doubly/Circular Linked Lists, Stacks, Queues, Deques)
2. *Trees & Hierarchies* (Tree, Binary Tree, BST, AVL Tree, Segment Tree, Binary Indexed Tree, Trie)
3. *Graphs & Networks* (Graph, BFS, DFS, Topological Sort, Shortest Path, Disjoint Set)
4. *Algorithmic Techniques* (Two Pointers, Sliding Window, Binary Search, Searching, Sorting, Prefix Sum, Kadane)
5. *Dynamic Programming & Recursion* (Dynamic Programming, LCS, Recursion, Backtracking, Divide & Conquer, Greedy)
6. *Math & Advanced Concepts* (Bit Magic, Mathematics, Number Theory, Combinatorial, Game Theory, Matrix, Geometric, Sqrt Decomposition, Heap, Hashing, Map, Set)

---

## Preview

<img width="1502" height="738" alt="LeetCamp Screenshot" src="https://github.com/user-attachments/assets/2508c7d3-a4b8-4dbd-8fb7-9c8121a90aa3" />

---

## Current Dataset

| Metric | Count |
|---|---:|
| Organizations | 470+ |
| DSA Patterns | 48 Categories |
| Pattern Questions | 2,961+ |
| Company Question Records | 37,700+ |
| Total Indexed Records | 40,670+ |

The dataset is organized for fast company-wise and pattern-wise querying and filtering.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 15 (App Router, React 18, TypeScript) |
| Styling | Tailwind CSS |
| Database | SQLite 3 |
| Database Driver | `better-sqlite3` (WAL Mode) |
| Icons | Lucide React |
| Runtime | Node.js 20+ |
| Deployment | Docker / Render / Railway / VPS |

---

## Architecture

```text
Company CSVs (470+ orgs) & Pattern CSVs (48 topics)
                     |
                     v
             Ingestion Pipeline
                     |
                     v
          SQLite Database [WAL Mode]
                     |
                     v
           Next.js API Routes
        /api/companies & /api/patterns
                     |
                     v
     Company Directory & Pattern Roadmaps
                     |
                     v
     Problem Explorer (Interactive Table)
                     |
                     v
       LeetCode / Problem Statements
```

---

## Project Structure

```text
LeetCamp/
├── data/
│   ├── problems.db                        # SQLite database (40,670+ records)
│   ├── patterns/                          # 48 DSA Pattern CSV collections
│   └── leetcode-company-wise-problems/    # Raw CSV datasets for 470+ companies
│
├── scripts/
│   └── ingest.ts                          # CSV parser and SQLite ingestion script
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── companies/                 # Company directories, problems & patterns
│   │   │   ├── patterns/                  # DSA pattern directories & problem queries
│   │   │   └── health/                    # Health check endpoint
│   │   ├── company/[company]/             # Company problem explorer page
│   │   ├── patterns/                      # DSA patterns directory page
│   │   │   └── [pattern]/                 # Pattern problem explorer page
│   │   ├── globals.css                    # Global CSS and CRT scanlines
│   │   ├── layout.tsx                     # Root layout
│   │   └── page.tsx                       # Main directory leaderboard
│   │
│   ├── components/
│   │   ├── BootSequence.tsx               # Terminal boot animation
│   │   ├── CompanyDirectory.tsx           # Company directory component
│   │   ├── PatternDirectory.tsx           # DSA Pattern directory component
│   │   ├── PatternExplorer.tsx            # Pattern problem explorer table with checkboxes
│   │   ├── ProblemExplorer.tsx            # Company problem table with filters & pagination
│   │   └── Navbar.tsx                     # Unified search bar (Company + Pattern) and header
│   │
│   └── lib/
│       └── db.ts                          # Database connection and queries
│
├── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md
└── package.json
```

---

## Getting Started

### Requirements

- Node.js 18.18+ or Node.js 20+ (Node v22 recommended)
- npm, yarn, or pnpm

### Clone

```bash
git clone https://github.com/vaibhavkumar955584-hub/LeetCamp.git
cd LeetCamp
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## Data Pipeline

To rebuild the database from the available company and pattern datasets:

```bash
npm run ingest
```

The ingestion pipeline:

1. Discovers company CSV datasets across 470+ organizations
2. Discovers 48 DSA pattern CSV collections
3. Normalizes difficulty, timeframe, frequency, acceptance, and accuracy data
4. Writes records into SQLite with dedicated indexes
5. Builds the database used by the application

---

## API Reference

### Companies
```http
GET /api/companies
GET /api/companies?search=Google
```

### Company Problems
```http
GET /api/companies/:company/problems?difficulty=Easy,Medium&timeframe=30_days&sort=frequency&page=1&limit=50
```

### Company Pattern Cross-References
```http
GET /api/companies/:company/patterns
```

### DSA Patterns Directory
```http
GET /api/patterns
GET /api/patterns?search=Tree
```

### DSA Pattern Problems
```http
GET /api/patterns/:pattern?difficulty=Medium,Hard&company=Amazon&sort=accuracy-desc&page=1&limit=50
```

### Health Check
```http
GET /api/health
```

---

## Deployment

LeetCamp supports containerized deployment.

### Docker

```bash
docker compose up -d --build
```

Deployment instructions for Render, Railway, Fly.io, Linux VPS, PM2, and Nginx are available in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Contributing

Contributions are welcome. Some areas for enhancement:

- Additional interview data sources and patterns
- Performance optimizations
- New visual analytics and topic mastery graphs
- Community company interview updates

Before opening a pull request, please ensure the project builds cleanly (`npm run build`).

---

## Data and Attribution

The interview-frequency dataset is derived from public community interview archives.

LeetCamp does not store or reproduce proprietary problem descriptions or official solutions.

All problem links point to corresponding official problem pages.

LeetCode is a registered trademark of LeetCode, LLC.

---

## Live Project

- **Try LeetCamp:** https://leetcamp.onrender.com/
- **Source Code:** https://github.com/vaibhavkumar955584-hub/LeetCamp
