# LeetCamp — Company-Wise LeetCode Interview Question Explorer

LeetCamp is a high-performance web application for exploring real-world technical interview problems asked by 429+ companies (such as Google, Amazon, Meta, Microsoft, Apple, Bloomberg, and more). It provides fast filtering by timeframe, difficulty, topic categories, and frequency rankings, with direct links to official LeetCode problem statements.

---

## Features

- **429+ Company Directories**: Explore categorized interview question banks across top tech companies.
- **Fast SQLite Engine**: 37,700+ indexed problem records powered by `better-sqlite3` in WAL mode for sub-millisecond query responses.
- **Recency Timeframe Filtering**:
  - `30 Days` (Recent interview trends)
  - `90 Days` (Quarterly)
  - `6 Months` (Semi-annual)
  - `More than 6 Months`
  - `All-Time`
- **Multi-Select Difficulty**: Real-time filtering by Easy, Medium, and Hard.
- **Topic Tags and Text Search**: Server-side SQL search across problem titles and topic tags (e.g., Dynamic Programming, Graphs, Trie).
- **Dynamic Sorting**: Sort questions by Frequency Score, Acceptance Rate, Difficulty, and Problem Title.
- **Direct Official Links**: Direct links to official LeetCode problem URLs.
- **CRT Phosphor Terminal Aesthetic**: High-contrast, responsive terminal-inspired UI with scanline styling and monospace typography.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 15 (App Router, React 18, TypeScript) |
| Styling | Tailwind CSS |
| Database | SQLite 3 via `better-sqlite3` (WAL Mode) |
| Icons | Lucide React |
| Runtime / Container | Node.js 20+ / Docker (Standalone Build) |

---

## Project Structure

```
LeetCamp/
├── data/
│   ├── problems.db                        # SQLite database (37,714 records)
│   └── leetcode-company-wise-problems/    # Raw CSV datasets for 471+ companies
├── scripts/
│   └── ingest.ts                          # CSV parser and SQLite ingestion script
├── src/
│   ├── app/
│   │   ├── api/                           # JSON REST API routes
│   │   │   ├── companies/                 # Company directories and problem queries
│   │   │   └── health/                    # Health check endpoint
│   │   ├── company/[company]/             # Company problem explorer page
│   │   ├── globals.css                    # Global CSS and CRT scanlines
│   │   ├── layout.tsx                     # Root layout
│   │   └── page.tsx                       # Main directory leaderboard
│   ├── components/
│   │   ├── BootSequence.tsx               # Terminal boot animation
│   │   ├── CompanyDirectory.tsx           # Company directory component
│   │   ├── Navbar.tsx                     # Search bar and header
│   │   └── ProblemExplorer.tsx            # Problem table with filters and pagination
│   └── lib/
│       └── db.ts                          # Database connection and queries
├── Dockerfile                             # Multi-stage production container build
├── docker-compose.yml                     # Docker Compose configuration
├── DEPLOYMENT.md                          # Production deployment guide
└── package.json                           # Dependencies and scripts
```

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+ (Node v22 recommended)
- npm, yarn, or pnpm

### 1. Installation
```bash
git clone https://github.com/vaibhavkumar955584-hub/LeetCamp.git
cd LeetCamp
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## Data Pipeline and Ingestion

To re-index or ingest fresh company CSV files into the SQLite database:

```bash
npm run ingest
```

The ingestion script:
1. Discovers all company CSV directories in `data/leetcode-company-wise-problems/`.
2. Normalizes timeframe, difficulty, frequency, and acceptance data.
3. Inserts records using transactional batch writes into `data/problems.db`.

---

## API Documentation

### 1. Get All Companies
```http
GET /api/companies
GET /api/companies?search=Google
```

### 2. Get Company Problems (Filtered and Paginated)
```http
GET /api/companies/:company/problems?difficulty=Easy,Medium&timeframe=30_days&sort=frequency&page=1&limit=50
```

### 3. Get Company Topic Tags
```http
GET /api/companies/:company/topics
```

### 4. Health Check
```http
GET /api/health
```

---

## Deployment

LeetCamp is configured for containerized and self-hosted environments:

### Run with Docker Compose
```bash
docker compose up -d --build
```

### Hosting Options
For step-by-step guides on deploying to Render, Railway, Fly.io, or a Linux VPS (with PM2 and Nginx), refer to [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Disclaimer and Attribution

- **Data Source**: Problem frequency dataset is derived from public community interview archives.
- **Content Policy**: This application does not store, scrape, or reproduce proprietary LeetCode problem descriptions or official solutions. All external links point directly to official problem pages on [LeetCode.com](https://leetcode.com).
- **Trademark**: LeetCode is a registered trademark of LeetCode, LLC.