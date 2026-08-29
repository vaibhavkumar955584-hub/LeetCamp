# LeetCamp

### Company-wise LeetCode Interview Question Explorer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20LeetCamp-black?style=for-the-badge)](https://leetcamp.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/vaibhavkumar955584-hub/LeetCamp)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-black?style=flat-square&logo=sqlite)](https://www.sqlite.org/)

**Prepare smarter. Target the company. Practice the problems that matter.**

[Visit LeetCamp](https://leetcamp.onrender.com/) · [View Source](https://github.com/vaibhavkumar955584-hub/LeetCamp)

---

## What is LeetCamp?

LeetCamp is a company-wise interview preparation platform that helps developers explore **LeetCode problems reported in technical interviews**.

Instead of randomly solving hundreds of problems, you can select the company you're targeting and explore its interview question history using filters such as:

- Company
- Timeframe
- Difficulty
- Topic
- Frequency
- Acceptance Rate

The goal is simple:

> **Turn interview preparation from a broad search into a focused plan.**

---

## Why I Built This

While preparing for technical interviews, one question kept coming up:

**"What should I actually practice for the company I'm targeting?"**

LeetCode is excellent for practicing coding problems, but I wanted a more focused way to explore problems **company-wise**.

So I built LeetCamp to make that process easier.

---

## Explore the App

### Company Directory

Explore interview question collections across **429+ companies**.

Choose a company and get a dedicated problem explorer for that organization.

### Filter by Time

Focus on recent interview patterns or explore historical questions.

```text
30 Days
90 Days
6 Months
More than 6 Months
All-Time
```

### Filter by Difficulty

Select one or multiple difficulty levels:

```text
Easy
Medium
Hard
```

### Search by Topic

Find questions related to topics such as:

```text
Arrays
Dynamic Programming
Graphs
Trees
Trie
Binary Search
Backtracking
and more
```

### Sort by What Matters

Sort questions by:

```text
Frequency
Acceptance Rate
Difficulty
Problem Title
```

### Go Directly to LeetCode

Every question links directly to its official LeetCode problem page.

---

## Preview

<img width="1502" height="738" alt="LeetCamp Screenshot" src="https://github.com/user-attachments/assets/2508c7d3-a4b8-4dbd-8fb7-9c8121a90aa3" />

---

## Current Dataset

| Metric | Count |
|---|---:|
| Companies | 429+ |
| Indexed Problems | 37,700+ |
| Company Question Records | 37,700+ |

The dataset is organized for fast company-wise querying and filtering.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 18, TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite 3 |
| Database Driver | better-sqlite3 |
| Icons | Lucide React |
| Runtime | Node.js 20+ |
| Deployment | Docker / Render / Railway / VPS |

---

## Architecture

```text
Company CSV Data
      |
      v
Ingestion Pipeline
      |
      v
SQLite Database
      |
      v
Next.js API Routes
      |
      v
Company Directory
      |
      v
Problem Explorer
      |
      v
LeetCode
```

The application uses SQLite in WAL mode with server-side filtering and pagination to keep queries fast even with a large dataset.

---

## Project Structure

```text
LeetCamp/
├── data/
│   ├── problems.db
│   └── leetcode-company-wise-problems/
│
├── scripts/
│   └── ingest.ts
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── companies/
│   │   │   └── health/
│   │   ├── company/[company]/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── BootSequence.tsx
│   │   ├── CompanyDirectory.tsx
│   │   ├── Navbar.tsx
│   │   └── ProblemExplorer.tsx
│   │
│   └── lib/
│       └── db.ts
│
├── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md
└── package.json
```

---

## Getting Started

### Requirements

- Node.js 18.18+ or Node.js 20+
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

To rebuild the database from the available company datasets:

```bash
npm run ingest
```

The ingestion pipeline:

1. Discovers company CSV datasets
2. Normalizes problem metadata
3. Processes timeframe, difficulty, frequency, and acceptance data
4. Writes the records into SQLite
5. Builds the database used by the application

---

## API

### Companies

```http
GET /api/companies
GET /api/companies?search=Google
```

### Company Problems

```http
GET /api/companies/:company/problems
```

Example:

```http
GET /api/companies/google/problems?difficulty=Easy,Medium&timeframe=30_days&sort=frequency&page=1&limit=50
```

### Topics

```http
GET /api/companies/:company/topics
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

Deployment instructions for Render, Railway, Fly.io, Linux VPS, PM2, and Nginx are available in:

[DEPLOYMENT.md](DEPLOYMENT.md)

---

## Contributing

Contributions are welcome.

Some areas that could be improved:

- Better company search
- Additional filtering options
- Improved mobile experience
- More interview data sources
- Performance improvements
- New visualizations and analytics

Before opening a pull request, please make sure the project builds successfully and the change is clearly documented.

---

## Roadmap

### Planned

- [ ] More companies
- [ ] Improved search
- [ ] Better topic analytics
- [ ] Company comparison
- [ ] Interview trend visualizations
- [ ] Personalized preparation lists
- [ ] Improved mobile UI

---

## Data and Attribution

The interview-frequency dataset is derived from public community interview archives.

LeetCamp does not store or reproduce proprietary LeetCode problem descriptions or official solutions.

All problem links point to the corresponding official pages on LeetCode.

LeetCode is a registered trademark of LeetCode, LLC.

---

## Live Project

**Try LeetCamp:**

https://leetcamp.onrender.com/

**Source Code:**

https://github.com/vaibhavkumar955584-hub/LeetCamp

---

## Feedback

Found a bug, have an idea, or want to contribute?

Open an issue or pull request on GitHub.

Built to make company-focused technical interview preparation more practical.
