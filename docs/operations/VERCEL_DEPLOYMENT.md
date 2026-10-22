# DoseLoop 2.0 — Production Vercel Deployment Handbook

This guide outlines the exact, step-by-step procedure to deploy DoseLoop 2.0 to **Vercel** as a unified full-stack application (React SPA + Express Serverless Functions).

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │            Vercel Edge               │
                      └──────────────────┬───────────────────┘
                                         │
                   ┌─────────────────────┴────────────────────┐
                   ▼                                          ▼
     Static File Serving                        Serverless Functions
     Path: `/*` (SPA Routes)                    Path: `/api/*`
     Directory: `client/dist`                   Handler: `api/index.js`
     Entry: `index.html`                        (Express 5 Application)
                                                              │
                                          ┌───────────────────┴───────────────────┐
                                          ▼                                       ▼
                                 Managed PostgreSQL                      Groq AI Platform
                             (Supabase / Neon / RDS)                 (`qwen/qwen3.8-27b`)
```

- **Frontend:** Compiled Vite SPA served from `client/dist`. Client-side routes (`/dashboard`, `/medications`, `/assistant`, etc.) rewrite to `/index.html`.
- **Backend:** Express API mounted under `/api/(.*)` via `api/index.js`, compiling TypeScript models with Prisma.
- **Database:** Requires a cloud-hosted PostgreSQL database (Supabase, Neon, AWS RDS, etc.). The local PostgreSQL cluster is for local offline development.
- **Cron Jobs:** Background medication reminder engine is triggered by Vercel Cron via `/api/v1/cron/reminders`.

---

## Step 1 — Local Preparation

Before committing and deploying, ensure all local checks pass:

1. **Verify TypeScript Compilation:**
   ```bash
   npm run type-check
   ```
   *Expected outcome: Zero errors; exits with code 0.*

2. **Verify Automated Tests:**
   ```bash
   npm run test
   ```
   *Expected outcome: 5/5 tests passing; exits with code 0.*

3. **Verify Full Production Build:**
   ```bash
   npm run build
   ```
   *Expected outcome: Generates both `client/dist` and `server/dist` successfully.*

4. **Review Git Status:**
   ```bash
   git status
   ```
   - **Files to commit:** Source files, `package.json`, `vercel.json`, `api/index.js`, `.env.example`, `docs/`.
   - **Files strictly excluded:** `.env`, `.env.local`, `node_modules/`, `dist/`, `.doseloop_db/`.

---

## Step 2 — Git Repository Setup

Push your repository to your GitHub account:

```bash
git add .
git commit -m "feat(release): modernize DoseLoop 2.0 for production Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/DOSELOOP.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Import into Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`DOSELOOP`).
4. **Root Directory:** Keep as `./` (Root directory of the repository).
5. **Framework Preset:** Select **"Other"** (Vercel will automatically read `vercel.json`).

---

## Step 4 — Build and Output Settings

Confirm that Vercel uses the following configuration (derived from `vercel.json`):

- **Build Command:** `npm run build`
- **Output Directory:** `client/dist`
- **Install Command:** `npm install`

---

## Step 5 — Environment Variables Table

Configure the following variables in **Project Settings > Environment Variables**:

| Variable Name | Required Scope | Secret? | Purpose | Where to Obtain |
|---|---|---|---|---|
| `NODE_ENV` | Production, Preview | No | Runtime mode (`production`) | Set to `production` |
| `DATABASE_URL` | Production, Preview | **Yes 🔒** | Pooled PostgreSQL connection string | Cloud Postgres (Supabase Pooler port 6543, Neon, etc.) |
| `DIRECT_URL` | Production, Preview | **Yes 🔒** | Direct connection for Prisma migrations | Cloud Postgres direct port 5432 |
| `GROQ_API_KEY` | Production, Preview | **Yes 🔒** | AI Assistant API Key | [console.groq.com/keys](https://console.groq.com/keys) |
| `GROQ_MODEL` | Production, Preview | No | Active Groq Model | `qwen/qwen3.8-27b` |
| `JWT_SECRET` | Production, Preview | **Yes 🔒** | Token signature security (32+ chars) | Generate via `openssl rand -hex 32` |
| `CRON_SECRET` | Production, Preview | **Yes 🔒** | Secures `/api/v1/cron/reminders` | Generate via `openssl rand -hex 32` |
| `VITE_API_URL` | Production, Preview | No | Frontend API Base path | Set to `/api/v1` (relative path) |
| `RESEND_API_KEY` | Production, Preview | Optional 🔒 | Email reminder delivery | [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL`| Production, Preview | Optional | Verified sender address | e.g. `notifications@yourdomain.com` |

> [!WARNING]
> Never prepend `VITE_` to `DATABASE_URL`, `GROQ_API_KEY`, or `JWT_SECRET`. Variables with the `VITE_` prefix are compiled directly into public client JavaScript.

---

## Step 6 — Database & AI Cloud Setup

1. **Database Migration:**
   Before launching live, push the schema to your cloud database from your local machine:
   ```bash
   DATABASE_URL="your-cloud-database-url" DIRECT_URL="your-cloud-direct-url" npx prisma db push
   ```
2. **Database Seeding (Optional):**
   ```bash
   DATABASE_URL="your-cloud-database-url" npx tsx prisma/seed.ts
   ```

---

## Step 7 — First Deployment

1. Click **"Deploy"** in Vercel.
2. Monitor the **Deployment Logs**:
   - Check that `prisma:generate` runs and emits the Prisma client.
   - Check that `vite build` completes and outputs static assets to `client/dist`.
3. If a build fails:
   - Verify `DATABASE_URL` is set in the Vercel dashboard.
   - Ensure the cloud database allows incoming connections from Vercel's IP ranges (enable `0.0.0.0/0` in Supabase/Neon network rules).

---

## Step 8 — Post-Deployment Smoke Test Checklist

Once deployed to `https://your-app.vercel.app`:

- [ ] **Liveness Probe:** Visit `https://your-app.vercel.app/api/v1/health` → Expect `{ "success": true, "data": { "status": "ok" } }`.
- [ ] **Database Readiness:** Visit `https://your-app.vercel.app/api/v1/health/ready` → Expect `{ "status": "ready", "checks": { "database": "ok" } }`.
- [ ] **Homepage & Auth:** Load root URL, navigate to `/auth`.
- [ ] **Dashboard:** Verify health rings, medication schedules, and family pulse render without console errors.
- [ ] **AI Assistant:** Go to `/assistant`, ask *"What are the side effects of Metformin?"*, and verify a fast, formatted Markdown response.
- [ ] **Theme Switching:** Toggle between Light and Dark mode; refresh page to confirm no theme flash occurs.

---

## Step 9 — Domain & Future Updates

- **Custom Domain:** Go to **Project Settings > Domains** and add your custom domain (e.g. `app.doseloop.com`). Configure the CNAME record in your DNS provider as instructed by Vercel.
- **Continuous Deployment:** Any commit pushed to the `main` branch on GitHub will automatically trigger an incremental build and zero-downtime deployment on Vercel.
