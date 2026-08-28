# Production Deployment Guide — LeetCamp Explorer

This document provides clear, step-by-step instructions to deploy **LeetCamp Explorer** to any production hosting provider.

---

## Architecture & Requirements

- **Framework**: Next.js 15 (App Router, Standalone Server)
- **Database**: SQLite 3 with WAL Mode (`better-sqlite3`)
- **Runtime**: Node.js 18+ / 20+ (LTS) or Docker container
- **Database Location**: `data/problems.db` (37,714 records, ~25MB)

> [!IMPORTANT]
> **Persistent SQLite Support:** Because this application uses SQLite via `better-sqlite3` (native C++ addon), deployments require a persistent filesystem or container runtime.
> Recommended targets: **Docker / Render / Railway / Fly.io / VPS (Ubuntu/Debian)**.

---

## Option 1: Deploy with Docker (Recommended)

### Using Docker Compose

1. Clone or copy your repository:
   ```bash
   git clone <your-repo-url>
   cd dsa_web
   ```

2. Start the container in detached mode:
   ```bash
   docker compose up -d --build
   ```

3. Verify health status:
   ```bash
   curl http://localhost:3000/api/health
   ```

4. View logs:
   ```bash
   docker compose logs -f
   ```

### Manual Docker Build & Run

```bash
# 1. Build the production Docker image
docker build -t leetcamp-explorer:latest .

# 2. Run container with data volume mount
docker run -d \
  --name leetcamp-app \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  leetcamp-explorer:latest
```

---

## Option 2: Deploy to Render.com (1-Click Free/Paid)

1. Push your code to GitHub or GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Select **Docker** environment (Render will automatically detect `Dockerfile` and `render.yaml`).
6. Set:
   - **Health Check Path**: `/api/health`
   - **Plan**: Free or Starter
7. Click **Create Web Service**.

---

## Option 3: Deploy to Railway.app

1. Install Railway CLI or connect via GitHub:
   ```bash
   npm install -g @railway/cli
   railway login
   ```
2. Link or create project:
   ```bash
   railway init
   railway up
   ```
3. (Optional) In the Railway dashboard under **Settings** → **Volumes**, add a volume mounted at `/app/data` for persistent SQLite writes.

---

## Option 4: Deploy to Fly.io

1. Install Fly CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Linux / macOS
   curl -L https://fly.io/install.sh | sh
   ```

2. Authenticate:
   ```bash
   fly auth login
   ```

3. Create volume for persistent SQLite:
   ```bash
   fly volumes create leetcamp_data --size 1
   ```

4. Launch & Deploy:
   ```bash
   fly deploy
   ```

---

## Option 5: Self-Hosted VPS (Ubuntu / Debian / AWS EC2 / DigitalOcean)

### Step 1: Install Node.js 20 & Build Tools

```bash
# Update package list & install build tools for better-sqlite3
sudo apt update && sudo apt install -y build-essential python3 curl git

# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 2: Clone & Build Application

```bash
git clone <your-repo-url> /var/www/leetcamp
cd /var/www/leetcamp

# Install dependencies
npm ci

# Ingest data if database is not present
npm run ingest

# Build standalone Next.js bundle
npm run build
```

### Step 3: Configure PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the standalone Next.js server
pm2 start .next/standalone/server.js --name "leetcamp" --env PORT=3000

# Save PM2 process list and configure auto-restart on boot
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy & SSL

Create `/etc/nginx/sites-available/leetcamp`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and install free SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/leetcamp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Install Certbot for Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Health Check & Monitoring

You can probe application status anytime via:

```http
GET /api/health
```

**Response Example:**
```json
{
  "status": "OK",
  "uptime": 1420,
  "timestamp": "2026-08-28T06:35:00.000Z",
  "latencyMs": 1,
  "database": {
    "status": "CONNECTED",
    "driver": "better-sqlite3 (WAL)",
    "totalRecords": 37714,
    "totalCompanies": 429,
    "lastIngestedAt": "2026-08-28T00:00:00.000Z"
  },
  "environment": "production"
}
```
