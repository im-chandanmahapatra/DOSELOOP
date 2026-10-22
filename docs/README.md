# DoseLoop Documentation Hub

Welcome to the central documentation index for the **DoseLoop** monorepo. This directory organizes all architectural specifications, clinical safety standards, operational runbooks, redesign plans, and deep-dive technical research.

---

## Directory Organization

```
docs/
├── architecture/
│   ├── PROJECT_BIBLE.md       # Master System Architecture, PRD, and Data Models
│   ├── PROJECT_AUDIT.md       # Full-stack audit, baseline status, and modernization log
│   └── DESIGN_SYSTEM.md       # Editorial Wine & Warm Ivory design tokens, typography, and states
├── plans/
│   └── UI_REDESIGN_PLAN.md    # UI/UX redesign roadmap, phase tracker, and component overhaul
├── operations/
│   ├── AI_DIAGNOSTICS.md      # Groq AI connectivity, model provisioning, and failover runbook
│   └── VERCEL_DEPLOYMENT.md   # Serverless production deployment, environment setup, and cron triggers
└── research/
    └── doseloop-browser-voice-r-and-d.md # Browser-native voice STT/TTS R&D and implementation report
```

---

## Documentation Categories

### 1. Architecture & Specifications (`docs/architecture/`)
- [**Project Bible (`PROJECT_BIBLE.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/architecture/PROJECT_BIBLE.md): The exhaustive, definitive guide to the DoseLoop system architecture, full product requirement document (PRD), entity relationship diagrams, database schemas, and service boundaries.
- [**Project Audit (`PROJECT_AUDIT.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/architecture/PROJECT_AUDIT.md): Comprehensive baseline audit evaluating TypeScript compilation, database latency, local mode fallbacks, and monorepo health.
- [**Design System (`DESIGN_SYSTEM.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/architecture/DESIGN_SYSTEM.md): "Quiet Premium" design tokens, typography hierarchy (Plus Jakarta Sans, Fraunces, Inter, IBM Plex Sans), and WCAG 2.2 AA accessibility guidelines.

### 2. Product & Design Roadmaps (`docs/plans/`)
- [**UI Redesign Plan (`UI_REDESIGN_PLAN.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/plans/UI_REDESIGN_PLAN.md): Detailed 6-phase implementation roadmap for modernizing the DoseLoop interface with calm editorial styling, adherence rings, and responsive components.

### 3. Operations & Deployment (`docs/operations/`)
- [**Vercel Deployment Handbook (`VERCEL_DEPLOYMENT.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/operations/VERCEL_DEPLOYMENT.md): Production deployment manual explaining serverless function routing (`api/index.js`), cron reminder schedules, and environment configuration.
- [**AI Diagnostics Runbook (`AI_DIAGNOSTICS.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/operations/AI_DIAGNOSTICS.md): Groq AI integration diagnostics, active model verification (`qwen/qwen3.8-27b`), and offline resilience validation.

### 4. Technical Research & Innovations (`docs/research/`)
- [**Browser Voice R&D Report (`doseloop-browser-voice-r-and-d.md`)**](file:///c:/Users/HP/OneDrive/Desktop/DOOSELOOP/docs/research/doseloop-browser-voice-r-and-d.md): In-depth research, browser compatibility matrix, clinical phonetics expander, Chromium 15s pause bug workaround, and full implementation verification report for browser-native speech.
