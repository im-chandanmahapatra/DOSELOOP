# DoseLoop

![DoseLoop Cover Image](https://via.placeholder.com/1200x600/0f172a/ffffff?text=DoseLoop+-+The+Calm+Medication+Tracker)

DoseLoop is a highly polished, privacy-first, and resilient medication and wellness tracker designed to bring peace of mind. Instead of stressful alerts and confusing dashboards, DoseLoop provides a calm, beautifully crafted interface that aggregates health metrics, tracks complex medication schedules, and keeps chosen family members gently informed without feeling invasive.

## Project Overview

DoseLoop bridges the gap between clinical rigidity and daily lifestyle. It is built to manage everything from simple vitamins to complex, critical regimens. Its unique "Family Circle" architecture allows users to share their well-being status with designated caregivers or family members while strictly maintaining boundaries and granular privacy controls. The application includes a smart AI assistant to answer general wellness inquiries contextually and a robust SOS emergency feature.

## Features

- **Advanced Medication Engine:** Handle multiple doses per day, complex recurrences, and custom schedules.
- **Family Circle:** Invite trusted caregivers and family members with fine-grained visibility controls (share medications vs. share wellness).
- **Calm Reminders:** Non-intrusive yet effective notifications to ensure adherence.
- **Wellness Tracking:** Log mood, hydration, and custom health metrics with beautiful, dynamic health rings.
- **AI Assistant:** An integrated, privacy-focused AI to ask general health, medication, and wellness questions.
- **Emergency SOS:** Immediately notify designated primary contacts during an emergency with one tap.
- **Full Privacy Controls:** Export your data, revoke access instantly, and toggle global privacy modes.
- **Dark/Light Mode:** A gorgeous, meticulously crafted UI with support for system-based and manual theme toggling.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, TanStack Router, TanStack Query, Radix UI, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript.
- **Database / ORM:** PostgreSQL, Prisma ORM.
- **Authentication & Core DB:** Supabase.
- **AI Integration:** Groq API.
- **Email Delivery:** Resend.

## Architecture

DoseLoop strictly separates the client and server. The client is a robust Single Page Application (SPA) communicating over a RESTful JSON API with the Node.js Express server. The server acts as a secure middleware and orchestration layer, handling business logic, transaction safety (via Prisma), and abstracting the Supabase REST/Auth layers, Groq, and Resend integrations. The database relies on a PostgreSQL schema meticulously designed for relational integrity.

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account
- A Groq API key
- (Optional) A Resend API key for email delivery

### Environment Variables

Both the client and server require environment variables to run. Example files have been provided.

**Client (`client/.env.example`)**:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:5000/api/v1
```

**Server (`server/.env.example`)**:
```env
DATABASE_URL=postgres://user:password@host:port/db?schema=public
DIRECT_URL=postgres://user:password@host:port/db?schema=public
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-supabase-jwt-secret
GROQ_API_KEY=your-groq-api-key
RESEND_API_KEY=your-resend-api-key
PORT=5000
```

Rename `.env.example` to `.env` in both the `client` and `server` directories and populate them with your actual keys. **Never commit these files to version control.**

### Database Setup

DoseLoop uses Prisma ORM to interact with PostgreSQL.

1. Navigate to the `server` directory.
2. Push the schema to your Supabase database:
   ```bash
   npx prisma db push
   ```
3. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```

### Supabase Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Go to Project Settings -> API to retrieve your `URL`, `anon` key, and `service_role` key.
3. Use the Database connection strings for your `DATABASE_URL` and `DIRECT_URL`.
4. Ensure Email/Password authentication is enabled in the Auth settings.

### Groq Setup

1. Create an account at [Groq Console](https://console.groq.com).
2. Generate an API Key and place it in the server's `GROQ_API_KEY` variable.

### Resend Setup (Optional)

1. Create an account at [Resend](https://resend.com).
2. Add and verify your domain.
3. Generate an API Key and add it to `RESEND_API_KEY`.

## Running the Application

### One-Command Local Development (Recommended)

DoseLoop 2.0 provides an automated root-level workflow:

```bash
# 1. (If using local Postgres) Start the local database in a separate terminal:
npm run db:start

# 2. Push schema & seed local data (once):
npm run db:push
npm run db:seed

# 3. Launch both Frontend and Backend concurrently:
npm run dev
```

- **Frontend Client:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000` (API routes under `/api/v1`)
- **Health Check:** `http://localhost:5000/health` (Liveness) & `http://localhost:5000/health/ready` (Readiness)
- **Shutdown:** Press `Ctrl + C` in the terminal to cleanly terminate both concurrently managed services.

### Local QA Testing Identity

For instant local development and end-to-end verification without requiring external Supabase cloud availability:
- **Name:** Aarav Sharma
- **Email:** `qa.aarav.sharma@example.com`
- **User ID:** `c55cdea5-b183-4127-bcb4-100cf11c08e0`
- **Instant Sign-in:** On the `/auth` screen, an "Instant Demo Sign-in" button is available in local development mode to log in immediately with this identity and access all dashboard, medication, and AI assistant features.

### Quality & Verification Commands

- `npm run test`: Executes the Node.js 22 native test runner against HTTP health & readiness APIs.
- `npm run type-check`: Verifies full TypeScript compilation across client and server with zero errors.
- `npm run build`: Compiles production assets for both Vite client and TypeScript server.
- `npm run db:studio`: Launches Prisma Studio on `http://localhost:5555` for visual database inspection.

### Architecture Documentation

Comprehensive architecture, design, and operational documentation is organized in [`docs/`](docs/README.md):
- [**Project Bible (`docs/architecture/PROJECT_BIBLE.md`)**](docs/architecture/PROJECT_BIBLE.md): Master System Architecture, Product Requirements Document (PRD), and Data Models.
- [**Project Audit (`docs/architecture/PROJECT_AUDIT.md`)**](docs/architecture/PROJECT_AUDIT.md): Complete architecture discovery, baseline status, and modernization log.
- [**Design System (`docs/architecture/DESIGN_SYSTEM.md`)**](docs/architecture/DESIGN_SYSTEM.md): Visual design language, semantic color tokens, typography scales, and micro-interactions.
- [**UI Redesign Plan (`docs/plans/UI_REDESIGN_PLAN.md`)**](docs/plans/UI_REDESIGN_PLAN.md): 6-phase implementation roadmap for the quiet premium interface.
- [**AI Diagnostics (`docs/operations/AI_DIAGNOSTICS.md`)**](docs/operations/AI_DIAGNOSTICS.md): Groq AI integration diagnostics, active model verification, and failover runbook.
- [**Vercel Deployment (`docs/operations/VERCEL_DEPLOYMENT.md`)**](docs/operations/VERCEL_DEPLOYMENT.md): Step-by-step production deployment handbook for Vercel Serverless.
- [**Browser Voice R&D (`docs/research/doseloop-browser-voice-r-and-d.md`)**](docs/research/doseloop-browser-voice-r-and-d.md): In-depth research, browser compatibility matrix, and implementation report for browser-native STT and TTS.

## Production Deployment (Vercel Serverless)

DoseLoop is configured to deploy seamlessly as a full-stack Serverless application on Vercel. 

Both the React frontend and the Express backend run on Vercel under a single domain.

### Steps to Deploy on Vercel

1. **Push to GitHub**: Push your complete `DOSELOOP` repository to a new GitHub repo.
2. **Import Project**: Log in to Vercel, click **Add New Project**, and import your GitHub repository.
3. **Framework Preset**: Vercel will auto-detect the configuration using `vercel.json`. Leave it as `Other`.
4. **Root Directory**: Leave as `./` (Root).
5. **Environment Variables**: Add ALL variables from both `server/.env` and `client/.env`.
   - Set `VITE_API_URL` to `/api/v1`
   - Ensure you generate a secure `CRON_SECRET`
6. **Deploy**: Click Deploy. Vercel will simultaneously build the Vite frontend and deploy the Express backend as Serverless Functions.

### Background Reminders (Cron)

Since the backend runs as serverless functions, long-running processes like `node-cron` cannot run continuously.
To enable medication reminders:
1. Go to your Vercel Project Settings.
2. Ensure you have added a `vercel.json` crons block (or configure it in the dashboard) to ping `/api/v1/cron/reminders` every minute.
3. Vercel will send a `Bearer` token matching your `CRON_SECRET` to execute the reminders safely.

## Repository Structure

```
DOSELOOP/
├── api/                    # Vercel serverless function entrypoint
│   └── index.js
├── client/                 # Frontend React 19 Application (Vite 8 + Tailwind v4)
│   ├── public/             # Static public assets
│   ├── src/                # Application source code
│   │   ├── components/     # Atomic UI, AppShell, and Brand components
│   │   ├── hooks/          # Custom React hooks (Mobile, Voice STT/TTS)
│   │   ├── lib/            # Utilities (API fetcher, Analytics, Speech)
│   │   ├── providers/      # Context providers (AuthProvider)
│   │   ├── routes/         # TanStack file-based routes
│   │   └── styles.css      # Design system CSS tokens
│   ├── test/               # Client unit tests (Speech phonetics & chunking)
│   └── package.json
├── server/                 # Backend Node.js / Express 5 Application
│   ├── prisma/             # Schema, migrations, RLS policies, seeders
│   ├── src/                # Domain-driven modular backend
│   │   ├── config/         # Environment, Logger config
│   │   ├── middlewares/    # Auth, Validation, Error middlewares
│   │   ├── modules/        # Domain modules (assistant, medications, etc.)
│   │   └── server.ts       # Express server initialization
│   ├── test/               # Server API health & integration tests
│   └── package.json
├── docs/                   # Documentation Hub
│   ├── README.md           # Master documentation index
│   ├── architecture/       # System specifications, Project Bible, Design System
│   ├── operations/         # Deployment runbooks and AI diagnostics
│   ├── plans/              # Product and UI redesign roadmaps
│   └── research/           # Deep-dive research papers and R&D reports
├── TASK.md                 # Active sprint task tracking ledger
├── package.json            # Monorepo workspaces configuration
├── vercel.json             # Vercel deployment & serverless routing config
└── README.md               # Primary project overview
```

## Screenshots

*(Placeholder: Add high-quality screenshots of the Dashboard, Medications, Family Circle, and AI Assistant here)*

## Contributing

Contributions are welcome! Please read the `CONTRIBUTING.md` file for guidelines on how to submit pull requests, report issues, and suggest enhancements.

## Future Roadmap

- **Advanced Wearable Integrations:** Sync data directly from Apple Health and Google Fit.
- **Enhanced AI Insights:** Predictive wellness reports and interactive check-ins.
- **Pharmacy Integrations:** Automatic refill requests and tracking.
- **Localization:** Support for Spanish, French, and German.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
