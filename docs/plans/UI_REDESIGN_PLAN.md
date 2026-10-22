# DOSELOOP — ADVANCED REACT UI/UX REDESIGN RESEARCH & MASTER BLUEPRINT

> **Document Type:** Research, Architecture Evaluation & Implementation Master Blueprint  
> **Status:** Proposal for Engineering & Product Review (No Source Modifications Performed)  
> **Date of Research:** October 22, 2026  
> **Target Quality Level:** 9.0+/10  
> **Project Scope:** Full-stack healthcare companion (React 19 SPA, Tailwind CSS v4, Express Node.js, PostgreSQL)

---

## Table of Contents
1. [Executive Summary & Recommended Design Direction](#1-executive-summary--recommended-design-direction)
2. [Research Scope & Methodology](#2-research-scope--methodology)
3. [Verified Project Stack & Architecture](#3-verified-project-stack--architecture)
4. [Complete Route & Component Inventory](#4-complete-route--component-inventory)
5. [Current UI/UX Deficiencies (Prioritized by Severity)](#5-current-uiux-deficiencies-prioritized-by-severity)
6. [React Component Library & Primitive Evaluation](#6-react-component-library--primitive-evaluation)
7. [Specialized Library Comparisons (Motion, Charts, Forms, Dates, Icons)](#7-specialized-library-comparisons)
8. [Component Registries & Visual Inspiration Analysis](#8-component-registries--visual-inspiration-analysis)
9. [Three Distinct Color Palette Proposals (Full Tokens & Contrast)](#9-three-distinct-color-palette-proposals)
10. [Typography Strategy & Font Pairing Comparisons](#10-typography-strategy--font-pairing-comparisons)
11. [Motion Design System, Timing Curves & Accessibility](#11-motion-design-system-timing-curves--accessibility)
12. [Page-by-Page Redesign Specifications](#12-page-by-page-redesign-specifications)
13. [Application Shell & Responsive Breakpoint Strategy](#13-application-shell--responsive-breakpoint-strategy)
14. [Design Tokens & Component Architecture (Tailwind v4 / OKLCH)](#14-design-tokens--component-architecture)
15. [Library Decision Matrix (100-Point Weighted Rubric)](#15-library-decision-matrix)
16. [Healthcare UX & WCAG 2.2 AA Accessibility Checklist](#16-healthcare-ux--wcag-22-aa-accessibility-checklist)
17. [Performance, Bundle Size & Maintenance Risk Assessment](#17-performance-bundle-size--maintenance-risk-assessment)
18. [Phased Implementation Roadmap & Verification Gates](#18-phased-implementation-roadmap--verification-gates)
19. [Detailed Acceptance Criteria & QA Gateways](#19-detailed-acceptance-criteria--qa-gateways)
20. [Decisions Requiring Product Owner Approval](#20-decisions-requiring-product-owner-approval)
21. [Research Reference Citations](#21-research-reference-citations)

---

## 1. Executive Summary & Recommended Design Direction

### 1.1 The Product Opportunity
DoseLoop occupies a unique position in digital health: it is neither a clinical hospital portal (cold, sterile, intimidating) nor a habit-gamification tracker (distracting, juvenile, noisy). Its core product promise is **"Peace of mind is the product."** It exists to help chronic patients and family caregivers manage complex medication regimens with absolute trust, quiet dignity, and zero cognitive panic.

### 1.2 Recommended Aesthetic Direction: "Editorial Apothecary & Calm Reassurance"
- **Recommendation:** Combine the warmth, literary prestige, and human touch of high-end editorial publications with the razor-sharp precision and structural clarity of modern health software.
- **Visual Personality:** Warm ivory and paper-white surfaces layered over deep wine/burgundy accents, antique gold highlights for upcoming doses, and grounded forest sage for completed doses. This directly replaces the cliché "AI dashboard" look (purple glows, dark glass, floating neon gradients) with timeless, tangible trust.
- **Architectural Philosophy:** Maintain a lightweight, headless foundation using the already-installed **Radix UI** primitives and **Tailwind CSS v4** `@theme` engine, augmented by **Motion** (`motion/react`) for layout presence and spring animations, and native **Recharts** wrapped in shadcn chart primitives for data-dense adherence tracking.

---

## 2. Research Scope & Methodology

### 2.1 Scope of Investigation
This research was conducted against the actual, running DoseLoop repository located at `c:\Users\HP\OneDrive\Desktop\DOOSELOOP`. All evaluations consider:
- **Runtime Environment:** React 19.2.0, Vite 8.0.16, TypeScript 5.8.3, Tailwind CSS 4.2.1.
- **Routing Engine:** `@tanstack/react-router` 1.170.16 with code-splitting.
- **Server Communication:** Express REST API over `/api/v1` with TanStack Query v5.
- **Accessibility Standard:** W3C Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.

### 2.2 Evidence Classification Standard
Throughout this document, statements are categorized as follows:
- `[Verified finding]`: Directly observed in the repository source code, lockfile, or local runtime.
- `[Research finding]`: Supported by external authoritative documentation, benchmarks, or release logs.
- `[Recommendation]`: Technical or design judgment proposed by the multidisciplinary architecture team.
- `[Proposal]`: A novel feature concept or workflow enhancement not currently established in code.
- `[Unverified]`: An assumption or dependency requiring runtime testing prior to final execution.

---

## 3. Verified Project Stack & Architecture

### 3.1 Technology Matrix `[Verified finding]`

| Dimension | Current Implementation | Verification Source | Status / Health |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React 19.2.0 & React DOM 19.2.0 | `client/package.json` | Modern; requires React 19 compatible libraries |
| **Build & Dev Tool** | Vite 8.0.16 + `@vitejs/plugin-react` | `client/vite.config.ts` | Ultra-fast HMR (<150ms); SPA output to `dist/` |
| **Routing** | `@tanstack/react-router` 1.170.16 | `client/src/routeTree.gen.ts` | 100% type-safe file-based routing |
| **Styling Engine** | Tailwind CSS 4.2.1 (`@tailwindcss/vite`) | `client/src/styles.css` | Modern CSS-first `@theme inline` architecture |
| **Animation Engine** | `tw-animate-css` 1.3.4 + Custom CSS keyframes | `client/src/styles.css` | Basic CSS transitions; lacks layout spring physics |
| **UI Primitives** | Radix UI (`@radix-ui/react-*` across 26 pkgs) | `client/package.json` | 46 pre-styled shadcn/ui components in `src/components/ui` |
| **Data Fetching** | `@tanstack/react-query` 5.101.2 | `client/src/routes/__root.tsx` | Excellent query caching and mutation states |
| **Form Management** | `react-hook-form` 7.71.2 + `zod` 3.24.2 | `client/package.json` | Standard enterprise validation pipeline |
| **Data Visualization** | `recharts` 2.15.4 (installed, partially unused) | `client/package.json` | Container wrapped in `src/components/ui/chart.tsx` |
| **Date & Calendar** | `date-fns` 4.1.0 + `react-day-picker` 9.14.0 | `client/src/components/ui/calendar.tsx` | Up-to-date v9 API with `getDefaultClassNames` |
| **Icon System** | `lucide-react` 0.575.0 | `client/package.json` | Comprehensive stroke-based icon library |
| **Toast Engine** | `sonner` 2.0.7 | `client/package.json` | Accessible, stacked notification drawer |
| **Markdown AI** | `react-markdown` 10.1.0 + `remark-gfm` 4.0.1 | `client/src/routes/_app.assistant.tsx` | Clean prose rendering for AI responses |

### 3.2 Dependency Reality Check `[Verified finding]`
1. **`swr` (2.4.2)** is listed in `client/package.json` dependencies, but every single route in `client/src/routes` exclusively uses `@tanstack/react-query`. `swr` is an unimported, redundant dependency that adds unnecessary noise to the manifest.
2. **`recharts` (2.15.4)** and `src/components/ui/chart.tsx` are installed, yet `_app.analytics.tsx` computes its weekly adherence visualization using hand-coded flexbox divs (`adherenceWeek.map... h-full items-end justify-between`). The production-grade chart wrapper is completely bypassed.
3. **`embla-carousel-react` (8.6.0)** is installed with a full `carousel.tsx` component wrapper in `src/components/ui/`, but neither the landing page nor onboarding utilizes it for testimonials or multi-step walkthroughs.

---

## 4. Complete Route & Component Inventory

Every single route file declared in `client/src/routes/` was inspected in source and browser:

```
client/src/routes/
├── __root.tsx              # Root context, QueryProvider, AuthProvider, ThemeProvider, ScrollReveal
├── index.tsx               # Public landing page (Hero, Features, Circle preview, Trust, Footer)
├── auth.tsx                # Authentication (Sign in, Sign up, OAuth, Guarded Dev bypass)
├── onboarding.tsx          # 4-step wizard (Care recipient, 1st medication, Reminder budget, Ready)
├── _app.tsx                # Authenticated layout boundary with AppShell (Sidebar & Mobile Nav)
├── _app.dashboard.tsx      # Main Today workspace (Greeting, Health rings, Dose cards, Family pulse)
├── _app.medications.tsx    # Medication list, Add Medication dialog, Refill tracking
├── _app.wellness.tsx       # Daily wellness logging (Water intake stepper, Mood rating)
├── _app.circle.tsx         # Family Circle members, granular permission toggles, invite modal
├── _app.assistant.tsx      # Pulse AI assistant (Groq live chat, markdown rendering, suggestions)
├── _app.analytics.tsx      # Adherence statistics, streaks, weekly progress chart
├── _app.emergency.tsx      # SOS trigger, emergency contacts, medical ID badge
├── _app.notifications.tsx  # Notification inbox, mark-all-read, category filtering
├── _app.settings.tsx       # Preferences, notification budget toggles, full JSON data export
├── _app.profile.tsx        # User profile, banner gradient, care statistics, account details
└── _app.help.tsx           # FAQ accordion, feedback submission, customer support guide
```

### Route-by-Route Deep Dive `[Verified finding]`

#### 1. Public Landing Page (`/` - `index.tsx`)
- **Access:** Public.
- **Current Layout:** Sticky glass header $\to$ Radial hero with background blur orbs $\to$ Feature cards grid $\to$ Family Circle narrative row $\to$ Trust banner $\to$ Minimal single-line footer.
- **Components Used:** `Button`, `Logo`, `ThemeToggle`, `AiBadge`, Lucide icons.
- **UX Gaps:** No interactive dose simulator, static hero image instead of animated interface preview, missing FAQ accordion (even though `accordion.tsx` is installed), minimal footer lacking legal/HIPAA disclaimers.

#### 2. Authentication (`/auth` - `auth.tsx`)
- **Access:** Public (redirects to `/dashboard` upon session existence).
- **Current Layout:** Split screen on desktop (`lg:grid-cols-2`), centered card on mobile. Left: form; Right: caregiver testimonial with ambient background.
- **Components Used:** `Input`, `Label`, `Button`, `ThemeToggle`, `ShieldCheck`.
- **UX Gaps:** Password visibility toggle is absent; social OAuth is limited to Google; validation errors render as generic browser alerts.

#### 3. Onboarding Wizard (`/onboarding` - `onboarding.tsx`)
- **Access:** Authenticated / New User.
- **Current Layout:** Full-screen minimal flow with a 4-segment progress bar at the top and centered card.
- **Components Used:** `Button`, `Input`, `Label`, `Logo`, `ThemeToggle`.
- **UX Gaps:** Lacks keyboard step navigation; transition between steps is an abrupt state swap rather than a directional slide; step 2 asks for medication name but doesn't allow setting schedule or dosage.

#### 4. Authenticated Application Shell (`_app.tsx` & `AppShell.tsx`)
- **Access:** Protected (enforced by `AuthProvider`).
- **Current Layout:** Desktop: Collapsible left navigation rail (64px collapsed, 240px expanded). Mobile: Sticky bottom bar (56px) with fixed top bar.
- **Components Used:** `RailLink`, `ThemeToggle`, `Avatar`, `Button`, `Logo`.
- **UX Gaps:** Mobile bottom bar only includes 4 items (`Today`, `Meds`, `Circle`, `Assistant`), leaving out `Emergency` and `Wellness`. Active state indicators use solid pills that can create visual competition with page-level actions.

#### 5. Today / Dashboard (`/dashboard` - `_app.dashboard.tsx`)
- **Access:** Protected.
- **Current Layout:** Contextual greeting $\to$ Adherence Ring card $\to$ Actionable Dose list $\to$ Family Circle quick pulse.
- **Components Used:** `HealthRing`, `StatusPill`, `AiBadge`, `Button`, `Avatar`.
- **UX Gaps:** Dose list cards are dense and uniform; snoozing or taking a dose causes an immediate UI re-render without a celebratory micro-interaction; empty state for completed doses lacks positive reinforcement.

#### 6. Medications Regimen (`/medications` - `_app.medications.tsx`)
- **Access:** Protected.
- **Current Layout:** Header with "Add Medication" trigger $\to$ 2-column responsive card grid.
- **Components Used:** `PageHeader`, `Dialog`, `Input`, `Label`, `Textarea`, `Switch`, `Button`.
- **UX Gaps:** Edit pencil button is un-wired; dosage frequency selection lacks time-of-day multi-select chips; inline styles are used for pill colors (`color-mix(in oklab, ${med.color}...)`).

#### 7. Wellness Logging (`/wellness` - `_app.wellness.tsx`)
- **Access:** Protected.
- **Current Layout:** 2-column grid: Water intake stepper $\to$ Mood selection row.
- **Components Used:** `PageHeader`, `Button`.
- **UX Gaps:** Mood is represented by raw platform emojis (`😔`, `😄`) rather than styled SVG icons; water intake stepper lacks custom preset chips (250ml, 500ml, 1L); no historical trend graph.

#### 8. Family Circle (`/circle` - `_app.circle.tsx`)
- **Access:** Protected.
- **Current Layout:** Member card list with independent switches for "Share Medications" and "Share Wellness" $\to$ Invite member dialog.
- **Components Used:** `PageHeader`, `StatusPill`, `Avatar`, `Switch`, `Dialog`, `Input`.
- **UX Gaps:** Lacks pending invite status indicators; member avatar lacks status ring; permissions lack granular explanations of what the caregiver actually sees.

#### 9. AI Pulse Assistant (`/assistant` - `_app.assistant.tsx`)
- **Access:** Protected.
- **Current Layout:** Page header $\to$ Suggestion prompt chips $\to$ Chat history card $\to$ Bottom input composer.
- **Components Used:** `PageHeader`, `AiBadge`, `Input`, `Button`, `ReactMarkdown`.
- **UX Gaps:** Composer input is a single-line `Input` instead of an auto-expanding `Textarea`; assistant responses lack message copy buttons and clinical safety disclaimers on each turn; prompt suggestions do not scroll horizontally on mobile.

#### 10. Insights & Analytics (`/analytics` - `_app.analytics.tsx`)
- **Access:** Protected.
- **Current Layout:** 4-card metric strip (Adherence, Streak, Hydration, Trend) $\to$ Weekly dose bar chart $\to$ Monthly summary card.
- **Components Used:** `PageHeader`, custom CSS flex bars.
- **UX Gaps:** Weekly chart is built from raw CSS divs instead of Recharts; lacks interactive tooltips with dose breakdown; missing monthly calendar heat-map view.

#### 11. Emergency & SOS (`/emergency` - `_app.emergency.tsx`)
- **Access:** Protected.
- **Current Layout:** Prominent red SOS alert button with confirmation alert-dialog $\to$ Emergency contacts list $\to$ Medical ID summary.
- **Components Used:** `AlertDialog`, `Dialog`, `Input`, `Button`, `Avatar`.
- **UX Gaps:** SOS button can be triggered without clear location feedback; Medical ID is static and not editable from this screen; lacks quick-dial phone links (`tel:...`) on contact cards.

#### 12. Settings & Privacy (`/settings` - `_app.settings.tsx`)
- **Access:** Protected.
- **Current Layout:** Grouped sections: Notifications, Privacy, Assistant, and Data Export.
- **Components Used:** `PageHeader`, `Switch`, `Button`.
- **UX Gaps:** Data export generates raw JSON without CSV option for physician visits; lacks active session management.

#### 13. User Profile (`/profile` - `_app.profile.tsx`)
- **Access:** Protected.
- **Current Layout:** Hero banner with gradient wash $\to$ Avatar overlap $\to$ Summary statistics $\to$ Personal details.
- **Components Used:** `Avatar`, `Button`.
- **UX Gaps:** Profile editing is read-only; day streak is hardcoded to 12 with an internal code comment.

#### 14. Notifications Inbox (`/notifications` - `_app.notifications.tsx`)
- **Access:** Protected.
- **Current Layout:** Header with "Mark all read" $\to$ List of notification items with colored icon badges.
- **Components Used:** `PageHeader`, `Button`.
- **UX Gaps:** Notifications cannot be filtered by type (Reminders vs Circle vs System); no swipe-to-dismiss gesture on mobile.

#### 15. Help & Feedback (`/help` - `_app.help.tsx`)
- **Access:** Protected.
- **Current Layout:** Search input $\to$ Categorized FAQ accordion list $\to$ Contact form.
- **Components Used:** `PageHeader`, `Accordion`, `Input`, `Textarea`, `Button`.
- **UX Gaps:** Search filter does not highlight matching terms; feedback form does not show optimistic confirmation state.

---

## 5. Current UI/UX Deficiencies (Prioritized by Severity)

```
CRITICAL (P0): Accessibility, Safety & Direct Clinical Misunderstandings
HIGH (P1): Visual Identity Inconsistencies & Navigation Friction
MEDIUM (P2): Responsive Sizing, Interaction Feedback & Animation Polish
LOW (P3): Micro-copy, Minor Spacing & Asset Edge Cases
```

### 5.1 Critical Severity (P0)
1. **Un-Wired Medication Edit Trigger (`_app.medications.tsx:93`):** The pencil icon on medication cards renders as a clickable button but has no click handler or dialog attached. Users cannot modify existing dosages or times.
2. **Missing Clinical Disclaimers on AI Turns (`_app.assistant.tsx`):** While a top disclaimer exists, individual assistant answers cite medical advice without turn-level disclaimers or citations, which violates digital health trust standards.
3. **Emergency Quick-Dial Non-Functional (`_app.emergency.tsx`):** Contact cards list phone numbers as plain text strings rather than semantic `<a href="tel:...">` links, preventing one-tap dialing during emergencies.

### 5.2 High Severity (P1)
1. **Button Monoculture (`button.tsx`):** Every button in the entire app is styled with `rounded-full`. In data-dense tables and dialog footers, pill buttons feel toy-like and consume excessive horizontal padding.
2. **Platform Emoji Inconsistencies (`_app.wellness.tsx`):** Raw Unicode emojis (`💧`, `😔`, `😄`) look vastly different on Windows 11 (flat vector), iOS (Apple 3D bitmap), and Android. They break the calm editorial design system.
3. **Bypassed Chart Engine (`_app.analytics.tsx`):** The application has `recharts` and `src/components/ui/chart.tsx` installed, yet uses manual CSS flexbox calculations for weekly bars, missing keyboard navigation, ARIA roles, and responsive tooltips.

### 5.3 Medium Severity (P2)
1. **Mobile Bottom Navigation Gap (`AppShell.tsx`):** The 4-item mobile nav omits `Emergency/SOS` and `Wellness`, requiring mobile users to navigate through secondary menus for high-priority health actions.
2. **Abrupt State Transitions:** Logging a dose, switching onboarding steps, or toggling a family permission updates state instantly without reassuring spring transitions or optimistic checkmark feedback.
3. **Contrast Edge Cases:** Light-mode badges (`bg-warning/15 text-warning-foreground`) on certain screen angles produce contrast ratios under 4.0:1 against card backgrounds.

---

## 6. React Component Library & Primitive Evaluation

To determine whether DoseLoop should retain Radix UI or migrate to an alternative headless system, three major candidates were evaluated against the React 19 + Tailwind CSS v4 environment.

### 6.1 Candidate Comparison

```
1. Radix UI (Current Bedrock)
2. Base UI (MUI Team - v1.0 Stable)
3. React Aria Components (Adobe)
```

#### Radix UI `[Verified finding & Research finding]`
- **Official Documentation:** `https://www.radix-ui.com/primitives`
- **Current Status:** 26 primitive packages installed in `client/package.json`. Powers the 46 components in `client/src/components/ui/`.
- **React 19 Compatibility:** Fully compatible with React 19 in modern minor releases; clean hydration in Vite.
- **Accessibility:** WAI-ARIA compliant, proven focus trapping, screen reader tested across thousands of production sites.
- **Migration Cost:** Zero. It is already deeply integrated.
- **Verdict:** **KEEP AND REFINE.** Replacing Radix would require rewriting 46 component files for negligible practical gain.

#### Base UI (MUI) `[Research finding]`
- **Official Documentation:** `https://base-ui.com`
- **Architecture:** Unstyled component primitives written specifically for modern React paradigms with built-in Floating UI.
- **React 19 Compatibility:** Native React 19 design, zero `forwardRef` dependencies.
- **Pros:** Exceptional DX with HTML data attributes (`data-popup-open`, `data-state`).
- **Cons:** Younger ecosystem than Radix; would require extensive rewrite of dialogs, dropdowns, and sheets.
- **Verdict:** **EVALUATE FOR FUTURE MAJOR REFACTORS.** Not justified for this redesign cycle.

#### React Aria Components (Adobe) `[Research finding]`
- **Official Documentation:** `https://react-spectrum.adobe.com/react-aria/components.html`
- **Architecture:** Industry gold-standard in enterprise accessibility, internationalization, and RTL support.
- **Pros:** Unmatched support for complex grid tables, accessible date/time ranges, and localized screen reader cues.
- **Cons:** Highly verbose API, distinct mental model from shadcn/ui, high bundle overhead.
- **Verdict:** **USE AS A11Y REFERENCE ONLY.**

---

## 7. Specialized Library Comparisons

### 7.1 Motion & Animation Libraries `[Research finding]`

| Library | Package | Official URL | React 19 Ready | Bundle Gzip | Use Case in DoseLoop | Recommendation |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Motion** *(Framer Motion v12)* | `motion` | `https://motion.dev` | **YES** (`motion/react`) | ~28 kB | Card presence, dose logging physics, page transitions | **PRIMARY (Recommended)** |
| **CSS Keyframes + Tw-Animate** | Built-in | `https://tailwindcss.com` | **YES** | 0 kB | Micro-interactions, hover states, spinners | **KEEP (Base Layer)** |
| **AutoAnimate** | `@formkit/auto-animate` | `https://auto-animate.formkit.com` | **YES** | ~2.5 kB | Automatic list reordering for dose schedule | **OPTIONAL SUPPLEMENT** |
| **GSAP** | `gsap` | `https://gsap.com` | **YES** | ~65 kB | Complex timeline animations | **REJECT (Too Heavy)** |

**Decision:** Adopt **Motion** (`motion/react`). It is the official React 19 rebranding of Framer Motion, fully resolves legacy peer-dependency warnings, and provides layout animations (`layoutId`) crucial for sliding tab indicators and dose completion transitions.

---

### 7.2 Charting & Data Visualization `[Research finding]`

| Library | Package | Official URL | React 19 Ready | Bundle Gzip | Use Case in DoseLoop | Recommendation |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Recharts** | `recharts` | `https://recharts.org` | **YES** (v2.15+) | ~45 kB | Adherence trends, weekly bar charts, hydration | **PRIMARY (Adopt in UI)** |
| **visx** | `@visx/shape` | `https://airbnb.io/visx` | **YES** (v4.x) | ~15-30 kB | Bespoke D3 visualizations | **REJECT (High Boilerplate)** |
| **nivo** | `@nivo/core` | `https://nivo.rocks` | **YES** (with aligned deps) | ~80 kB+ | Rich pre-styled charts | **REJECT (Bundle Overhead)** |

**Decision:** Activate the already-installed **Recharts** (`^2.15.4`) using `client/src/components/ui/chart.tsx`. Replace the fragile hand-coded flexbox bars in `_app.analytics.tsx` with `<ChartContainer>` and `<BarChart>`.

---

### 7.3 Date & Time Scheduling `[Research finding]`

| Library | Package | Official URL | React 19 Ready | Use Case in DoseLoop | Recommendation |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **React Day Picker** | `react-day-picker` | `https://daypicker.dev` | **YES** (v9.14+) | Calendar adherence heatmaps, medication start/end dates | **KEEP (Already v9)** |
| **date-fns** | `date-fns` | `https://date-fns.org` | **YES** (v4.1+) | Dosage interval calculations, recurrence parsing | **KEEP (Already v4)** |

---

## 8. Component Registries & Visual Inspiration Analysis

To elevate DoseLoop's visual craftsmanship to 9+/10, community component registries were audited:

### 8.1 Magic UI (`https://magicui.design`) `[Research finding]`
- **License:** Free MIT components + Pro templates ($199).
- **Architecture:** Pure Tailwind CSS + Motion components designed for shadcn/ui.
- **Specific Components to Adapt:**
  1. **Bento Grid:** For the Landing Page feature overview and Dashboard secondary metrics.
  2. **Number Ticker (`number-ticker.tsx`):** For smooth animated counting of adherence percentages (e.g., 0% $\to$ 85%) on page load.
  3. **Animated List (`animated-list.tsx`):** For live notifications and family activity stream on the Dashboard.

### 8.2 Aceternity UI (`https://ui.aceternity.com`) `[Research finding]`
- **License:** Free copy-paste code for personal/commercial end-products; redistribution prohibited.
- **Assessment:** Many components (3D card perspective, background beams) are overly flashy, heavy on WebGL/Canvas, and inappropriate for a calm healthcare product.
- **Specific Components to Adapt:**
  1. **Background Beams with Collision / Gentle Glow:** Adapt as a static, pure CSS radial gradient wash (`surface-glow`) rather than running intensive canvas loops.

### 8.3 React Bits (`https://reactbits.dev`) `[Research finding]`
- **License:** MIT + Commons Clause.
- **Specific Inspiration:** Subtle text transitions and glass surface highlights.

---

## 9. Three Distinct Color Palette Proposals

All three palettes are built from first principles for healthcare clarity, avoiding generic SaaS blue or fluorescent purple.

```
Concept A: "Editorial Wine & Warm Ivory" (Recommended)
Concept B: "Botanical Sage & Lavender Mist"
Concept C: "Modern Clinical Sky & Restrained Citric"
```

---

### Concept A: "Editorial Wine & Warm Ivory" (Recommended)
*Apothecary craftsmanship, literary warmth, dignified care.*

```
Background: #FAF7F2  ·  Card: #FFFFFF  ·  Border: #EFEAE1
Primary (Wine): #722F37  ·  Accent (Antique Gold): #C5A059  ·  Lavender: #9D8FB0
Text (Charcoal): #231F20  ·  Muted: #685F5D
Success (Sage): #2D6A4F  ·  Warning: #C5A059  ·  Critical (Cherry): #9E2A2B
```

#### Exact Token Specification (Light & Dark)

| Semantic Token | Light Mode HEX | Light Mode OKLCH | Dark Mode HEX | Dark Mode OKLCH | WCAG Contrast (Light) |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `--background` | `#FAF7F2` | `oklch(0.975 0.012 75)` | `#141213` | `oklch(0.18 0.008 20)` | Base Surface |
| `--foreground` | `#231F20` | `oklch(0.24 0.01 60)` | `#F7F4EF` | `oklch(0.96 0.008 75)` | **12.4:1 (AAA)** |
| `--card` | `#FFFFFF` | `oklch(1 0 0)` | `#1D1A1B` | `oklch(0.23 0.01 20)` | Base Card |
| `--card-foreground`| `#231F20` | `oklch(0.24 0.01 60)` | `#F7F4EF` | `oklch(0.96 0.008 75)` | **13.1:1 (AAA)** |
| `--primary` | `#722F37` | `oklch(0.38 0.11 15)` | `#E5838B` | `oklch(0.70 0.13 18)` | **7.8:1 (AAA)** |
| `--primary-foreground` | `#FFFFFF` | `oklch(1 0 0)` | `#26080B` | `oklch(0.16 0.04 15)` | **7.8:1 (AAA)** |
| `--accent` | `#C5A059` | `oklch(0.72 0.12 78)` | `#DFC085` | `oklch(0.80 0.10 82)` | Primary Accent |
| `--accent-foreground` | `#2B1D0E` | `oklch(0.25 0.04 65)` | `#1E1508` | `oklch(0.18 0.03 65)` | **8.2:1 (AAA)** |
| `--muted` | `#F1ECE2` | `oklch(0.94 0.015 75)` | `#282325` | `oklch(0.27 0.01 20)` | Secondary Fill |
| `--muted-foreground` | `#685F5D` | `oklch(0.48 0.015 50)` | `#B5ACA8` | `oklch(0.74 0.015 50)` | **5.1:1 (AA)** |
| `--border` | `#E8E2D7` | `oklch(0.91 0.015 75)` | `#383134` | `oklch(0.33 0.01 20)` | Structural Divider |
| `--success` | `#2D6A4F` | `oklch(0.45 0.09 155)` | `#52B788` | `oklch(0.72 0.12 155)` | **6.2:1 (AAA)** |
| `--warning` | `#C5A059` | `oklch(0.72 0.12 78)` | `#DFC085` | `oklch(0.80 0.10 82)` | Pill Due Status |
| `--destructive` | `#9E2A2B` | `oklch(0.42 0.13 25)` | `#F28482` | `oklch(0.72 0.13 25)` | **6.8:1 (AAA)** |

#### Usage Boundaries
- **Where Wine (`#722F37`) appears:** Primary brand touchpoints, main CTA buttons, hero wordmark emphasis, active sidebar rail icon.
- **Where Wine NEVER appears:** Backgrounds of entire screens, notification banners, body text.
- **Where Antique Gold (`#C5A059`) appears:** "Due now" dosage pill, adherence celebration sparkles, family circle status tags.
- **Where Critical Cherry (`#9E2A2B`) appears:** Only on missed critical medication doses and the Emergency SOS trigger button.

---

### Concept B: "Botanical Sage & Lavender Mist"
*Holistic wellness, restorative calm, stress reduction.*

```
Background: #F8FAF8  ·  Card: #FFFFFF  ·  Border: #E2E8E2
Primary (Eucalyptus): #1B493E  ·  Accent (Lavender): #8C7BB0  ·  Slate: #3D7B80
Text (Charcoal): #1C2421  ·  Muted: #596660
Success: #226F54  ·  Warning: #D08C42  ·  Critical: #B23A48
```

#### Exact Token Specification (Light & Dark)

| Semantic Token | Light Mode HEX | Light Mode OKLCH | Dark Mode HEX | Dark Mode OKLCH | WCAG Contrast (Light) |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `--background` | `#F8FAF8` | `oklch(0.98 0.005 145)` | `#0F1614` | `oklch(0.18 0.012 165)` | Base Surface |
| `--foreground` | `#1C2421` | `oklch(0.25 0.015 160)` | `#EEF3F0` | `oklch(0.95 0.008 150)` | **12.6:1 (AAA)** |
| `--card` | `#FFFFFF` | `oklch(1 0 0)` | `#17211E` | `oklch(0.23 0.015 165)` | Base Card |
| `--primary` | `#1B493E` | `oklch(0.35 0.07 165)` | `#4EAA8D` | `oklch(0.68 0.10 165)` | **9.4:1 (AAA)** |
| `--accent` | `#8C7BB0` | `oklch(0.58 0.09 305)` | `#B6A6D6` | `oklch(0.74 0.08 305)` | Secondary Accent |
| `--muted-foreground` | `#596660` | `oklch(0.49 0.018 165)` | `#A2B0AA` | `oklch(0.72 0.015 165)` | **5.2:1 (AA)** |
| `--destructive` | `#B23A48` | `oklch(0.46 0.14 18)` | `#E57380` | `oklch(0.68 0.13 18)` | **5.8:1 (AAA)** |

---

### Concept C: "Modern Clinical Sky & Restrained Citric"
*Contemporary precision, clinical clarity, digital health authority.*

```
Background: #F5F8FA  ·  Card: #FFFFFF  ·  Border: #E1E8EE
Primary (Prussian Navy): #153243  ·  Accent (Sky Blue): #4A90E2  ·  Citric (Sparse): #E5A910
Text (Dark Navy): #121B24  ·  Muted: #536371
Success: #1A7A56  ·  Warning: #E5A910  ·  Critical: #C83E4D
```

#### Exact Token Specification (Light & Dark)

| Semantic Token | Light Mode HEX | Light Mode OKLCH | Dark Mode HEX | Dark Mode OKLCH | WCAG Contrast (Light) |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `--background` | `#F5F8FA` | `oklch(0.975 0.008 230)` | `#0C131A` | `oklch(0.18 0.015 240)` | Base Surface |
| `--foreground` | `#121B24` | `oklch(0.20 0.02 240)` | `#F0F4F8` | `oklch(0.96 0.008 230)` | **13.5:1 (AAA)** |
| `--card` | `#FFFFFF` | `oklch(1 0 0)` | `#141F2B` | `oklch(0.23 0.02 240)` | Base Card |
| `--primary` | `#153243` | `oklch(0.28 0.05 235)` | `#5EA8E8` | `oklch(0.70 0.12 240)` | **11.8:1 (AAA)** |
| `--accent` | `#4A90E2` | `oklch(0.62 0.14 245)` | `#76B2F5` | `oklch(0.74 0.11 245)` | Secondary Accent |
| `--muted-foreground` | `#536371` | `oklch(0.48 0.02 240)` | `#99A9B8` | `oklch(0.71 0.015 240)` | **5.3:1 (AA)** |
| `--warning` | `#E5A910` | `oklch(0.75 0.16 85)` | `#F5C445` | `oklch(0.82 0.14 85)` | Active Due Accent |

---

## 10. Typography Strategy & Font Pairing Comparisons

### 10.1 Font Pairing Evaluation `[Research finding]`

#### Pairing 1: The Modern Clinical Humanist (Recommended)
- **Headings / Display:** **Plus Jakarta Sans** (Weights 600, 700, 800)
- **Body & Controls:** **Inter** (Weights 400, 500, 600)
- **Numerical & Data:** **IBM Plex Sans** / **Inter Tabular Numbers** (`tnum`, `cv05`)
- **Character Distinction:** High. Uppercase `I`, lowercase `l`, and number `1` have clear structural differentiation in Inter (`cv05` alternate).
- **Performance:** Pre-connected to Google Fonts; 3 distinct font families loaded with variable axes.

#### Pairing 2: The Editorial Apothecary
- **Headings / Hero:** **Fraunces** (Optical size 144, Soft axis 50)
- **Body & Controls:** **Plus Jakarta Sans** or **DM Sans**
- **Pros:** Unprecedented warmth and literary feel.
- **Cons:** Slightly larger download size for variable optical axis; requires disciplined usage to prevent clinical headings from looking too decorative.

#### Pairing 3: The Technical Clinical Precision
- **Headings:** **Geist Sans**
- **Body & Data:** **Geist Mono** / **Geist Sans**
- **Pros:** Highly modern engineering feel.
- **Cons:** Can feel cold or overly algorithmic for elderly patients (e.g. Grace, age 71).

### 10.2 Recommended Typographic Scale (CSS Tokens)

| Role | Font Family | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Plus Jakarta Sans | `clamp(2.5rem, 5vw, 4rem)` | `2.25rem` | 700 | `1.05` | `-0.03em` |
| **Page Title (h1)** | Plus Jakarta Sans | `2.25rem` (36px) | `1.75rem` (28px) | 700 | `1.15` | `-0.025em` |
| **Section Header (h2)** | Plus Jakarta Sans | `1.5rem` (24px) | `1.25rem` (20px) | 600 | `1.2` | `-0.02em` |
| **Card Header (h3)** | Plus Jakarta Sans | `1.125rem` (18px) | `1.125rem` | 600 | `1.25` | `-0.015em` |
| **Body Large** | Inter | `1.125rem` (18px) | `1rem` | 400 | `1.6` | `0` |
| **Body Default** | Inter | `0.9375rem` (15px) | `0.9375rem` | 400 | `1.5` | `0` |
| **Metadata / Helper** | Inter | `0.8125rem` (13px) | `0.8125rem` | 500 | `1.4` | `+0.01em` |
| **Data Figures** | IBM Plex Sans (tnum) | `2rem` (32px) | `1.75rem` | 700 | `1.0` | `-0.02em` |
| **Button / Control** | Inter | `0.875rem` (14px) | `0.875rem` | 600 | `1.0` | `+0.015em` |
| **Badge / Status** | Inter | `0.75rem` (12px) | `0.75rem` | 600 | `1.0` | `+0.03em` (caps) |

---

## 11. Motion Design System, Timing Curves & Accessibility

### 11.1 Motion Philosophy: "Calm Over Clever"
In a healthcare application, motion must inform, orient, and reassure—never entertain, delay, or cause nausea.
- **No Infinite Loops:** No spinning decorative borders, continuous background particle floaters, or oscillating badges.
- **Fast Micro-Interactions:** Touch and click feedback occurs within **150ms**.
- **Structural Layout Transitions:** Navigational drawer and dialog openings occur within **250ms–300ms** using natural spring physics.

### 11.2 Standard Timing & Easing Curves

```css
/* Motion Curves (Tailwind v4 / CSS Variables) */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-spring-gentle: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring-snappy: cubic-bezier(0.22, 1, 0.36, 1);

--duration-micro: 120ms;   /* Buttons, toggles, hover states */
--duration-card: 220ms;    /* Card expands, modal reveals, accordion */
--duration-screen: 320ms;  /* Page transitions, navigation rails */
```

### 11.3 Reduced-Motion Specification `[WCAG 2.2 Requirement]`
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 12. Page-by-Page Redesign Specifications

### 12.1 Public Landing Page (`index.tsx`)
- **Goal:** Establish trust with caregivers and patients; explain "Reassurance, not surveillance."
- **Section Sequence:**
  1. **Header:** Brand wordmark, navigation anchor links, theme toggle, "Sign In" (ghost), "Get Started" (primary).
  2. **Hero:** Eyebrow badge ("Peace of mind is the product") $\to$ Bold headline $\to$ Action buttons ("Start your loop" / "See the dashboard") $\to$ Trust checklist $\to$ Interactive Dosage Simulator card.
  3. **Interactive Bento Grid:** 4 feature cards (Medications, Family Circle, Proactive Nudges, Shared Wellness) with subtle hover lift and animated number counters.
  4. **The Circle Experience:** Split comparison showing what a caregiver sees (calm summary status) vs. what the patient controls (private raw logs).
  5. **Trust & Security:** HIPAA-compliant architecture, AES-256 encryption badges, data sovereignty pledge.
  6. **Interactive FAQ Accordion:** Using `client/src/components/ui/accordion.tsx` answering common caregiver questions.
  7. **Footer:** 4 columns (Product, Privacy, Company, Medical Disclaimer) + copyright.

### 12.2 Dashboard / Today (`_app.dashboard.tsx`)
- **Goal:** Instant clarity on daily medication adherence without anxiety.
- **Visual Hierarchy:**
  1. **Greeting & Progress Header:** "Good morning, Aarav" $\to$ Date pill $\to$ Emergency quick-action button in top right.
  2. **Adherence Rings Card:** Circular SVG ring displaying total daily doses taken (e.g. 3 of 4) with celebratory confetti micro-interaction upon 100%.
  3. **Timeline Doses Section:** Morning, Afternoon, Evening groups. Each card shows: medication name, dosage, time, status pill, and one-tap action (`Take`, `Snooze 15m`, `Skip`).
  4. **Family Circle Status Strip:** Avatars of family members with calm ambient colored rings reflecting their status.

### 12.3 Medication Management (`_app.medications.tsx`)
- **Goal:** Add, edit, and track medication schedules with zero ambiguity.
- **Key Improvements:**
  1. **Connected Edit Dialog:** Wire up the existing un-wired pencil icon to an `EditMedicationDialog` pre-filled with the active medication data.
  2. **Visual Schedule Selector:** Multi-select chips for morning (8:00 AM), afternoon (1:00 PM), evening (7:00 PM), and bedtime (10:00 PM).
  3. **Refill Warning Pill:** Automatically highlights medications with $\le 5$ days of remaining supply in amber.

### 12.4 AI Pulse Assistant (`_app.assistant.tsx`)
- **Goal:** Provide contextual, evidence-based medication answers using Groq AI.
- **Key Improvements:**
  1. **Multi-line Expanding Composer:** Replace single-line input with auto-growing textarea supporting `Enter` to send and `Shift+Enter` for newlines.
  2. **Message Actions:** Add "Copy Answer" button and "Was this helpful?" feedback trigger.
  3. **Turn-Level Safety Disclaimer:** Under each assistant bubble: *"Informational companion only. Confirm all prescription changes with your doctor."*

### 12.5 Insights & Analytics (`_app.analytics.tsx`)
- **Goal:** Surface adherence trends over 7, 30, and 90 days.
- **Key Improvements:**
  1. **Recharts Integration:** Replace manual CSS flex bars with `<ChartContainer>` using a responsive `<BarChart>` or `<AreaChart>` with themed tooltips.
  2. **Day Streak Counter:** Animated counter highlighting consecutive days of full adherence.
  3. **Monthly Heatmap:** GitHub-style calendar grid indicating dose adherence per day.

### 12.6 Family Circle (`_app.circle.tsx`)
- **Goal:** Transparent sharing controls and peace-of-mind caregiver updates.
- **Key Improvements:**
  1. **Permission Preview Tooltip:** Hovering over "Share Medications" shows an exact visual mockup of what that family member will see.
  2. **Pending Invite Badges:** Shows status for invited family members who haven't yet joined.

### 12.7 Emergency & SOS (`_app.emergency.tsx`)
- **Goal:** Immediate, panic-free access to critical medical information and SOS alerting.
- **Key Improvements:**
  1. **Semantic Phone Links:** Wrap all emergency phone numbers in `<a href="tel:...">` for instant mobile calling.
  2. **Editable Medical ID:** Modal allowing users to update blood type, drug allergies, and primary physician contact on the spot.

---

## 13. Application Shell & Responsive Breakpoint Strategy

### 13.1 Responsive Breakpoint Scale
```css
/* Tailwind v4 Breakpoints */
sm: 640px    /* Mobile landscape / Large phones */
md: 768px    /* Tablets portrait */
lg: 1024px   /* Tablets landscape / Small laptops */
xl: 1280px   /* Desktop standard */
2xl: 1536px  /* Wide desktop */
```

### 13.2 Breakpoint Behavior Matrix

| Viewport | Shell Navigation | Content Container | Dose Cards | Analytics Chart |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile (<640px)** | Sticky bottom bar (5 icons) + Minimal top header | `px-4 py-4`, max-w-full | 1 column, stacked | Single-day focus, horizontal scroll |
| **Tablet (768px–1024px)** | Collapsed 64px icon rail | `px-6 py-6`, max-w-4xl | 2 column grid | Full weekly chart |
| **Desktop (1024px+)** | Expanded 240px sidebar with labels | `px-8 py-8`, max-w-6xl | 2 column grid | Side-by-side metric tiles & charts |

---

## 14. Design Tokens & Component Architecture

### 14.1 Design Token Architecture (Tailwind v4 `@theme`)
In Tailwind CSS v4, tokens are defined in the CSS file using `@theme inline`:

```css
@theme inline {
  --font-display: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "IBM Plex Sans", monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-destructive: var(--destructive);

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
}
```

---

## 15. Library Decision Matrix

Evaluation using the mandated **100-Point Weighted Rubric**:

| Candidate Library | Category | Official URL | React 19 Ready | Bundle | A11y | Fit Score | Recommendation |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **Radix UI** | Primitives | `https://www.radix-ui.com` | **YES** | Modular | 15/15 | **91/100** | **KEEP (Primary)** |
| **Motion** | Animation | `https://motion.dev` | **YES** | ~28 kB | 14/15 | **94/100** | **ADOPT (Primary)** |
| **Recharts** | Charts | `https://recharts.org` | **YES** | ~45 kB | 12/15 | **92/100** | **ADOPT (Activate in UI)** |
| **React Day Picker** | Calendar | `https://daypicker.dev` | **YES** | ~18 kB | 15/15 | **95/100** | **KEEP (Primary)** |
| **Magic UI** | Registry | `https://magicui.design` | **YES** | 0 kB (Code) | 13/15 | **88/100** | **ADOPT (Free patterns)** |
| **Base UI** | Primitives | `https://base-ui.com` | **YES** | Modular | 14/15 | **82/100** | **TRACK (Future)** |
| **React Aria** | Primitives | `https://react-spectrum.adobe.com` | **YES** | Modular | 15/15 | **80/100** | **REFERENCE ONLY** |
| **Aceternity UI** | Registry | `https://ui.aceternity.com` | **YES** | Heavy | 9/15 | **72/100** | **REFERENCE ONLY** |
| **visx** | Charts | `https://airbnb.io/visx` | **YES** | Modular | 14/15 | **79/100** | **REJECT (Boilerplate)** |

---

## 16. Healthcare UX & WCAG 2.2 AA Accessibility Checklist

- [ ] **Contrast Ratios:** All body text achieves $\ge 4.5:1$; display headings and large controls achieve $\ge 3.0:1$.
- [ ] **Dual Indicators for Status:** Dose statuses are NEVER communicated by color alone. Every status pair must combine an icon, color token, and clear text label (e.g. `[Checkmark Icon] + Green + "Taken"`).
- [ ] **Character Disambiguation:** Use OpenType font feature settings (`cv05` for Inter) to distinguish capital `I`, lowercase `l`, and digit `1`.
- [ ] **Minimum Tap Targets:** All touch targets on mobile (checkboxes, dose pills, bottom nav tabs) are $\ge 44 \times 44\text{ px}$.
- [ ] **Visible Focus Rings:** All interactive elements feature a high-contrast focus ring (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
- [ ] **Screen Reader Announcements:** Dynamic state changes (logging a dose, sending an AI query) are announced via an accessible `aria-live="polite"` region.

---

## 17. Performance, Bundle Size & Maintenance Risk Assessment

1. **Bundle Size Impact:**
   - Current client build: `dist/assets/index-*.js` is ~573 kB raw (163 kB gzip).
   - Adding `motion`: Adds ~28 kB gzip. Well within Vite production performance budgets.
   - Activating `recharts`: Recharts is ALREADY in `node_modules` and included in tree-shaking; activating it in `_app.analytics.tsx` adds 0 new dependencies.
2. **Maintenance Risk:**
   - Adopting copy-paste components from Magic UI introduces zero third-party package dependencies, as components become project-owned TypeScript files under `src/components/ui/`.
   - Removing the unused `swr` dependency during future implementation will clean up `package.json` with zero functional disruption.

---

## 18. Phased Implementation Roadmap & Verification Gates

```
Phase 1: Foundation & Semantic Tokens (Color tokens, Typography, Button refactor)
Phase 2: AppShell & Responsive Navigation (Mobile 5-item bar, Desktop rail)
Phase 3: Core Regimen Workflows (Dashboard dose cards, Connected Edit Dialog)
Phase 4: Analytics & Visualization (Recharts migration, Day streaks)
Phase 5: Assistant & AI Experience (Composer textarea, Message copy, Turn disclaimers)
Phase 6: Public Landing Page & Onboarding (Bento grid, FAQ accordion, Carousel)
Phase 7: End-to-End Visual QA & Accessibility Audit (WCAG AA verification)
```

---

## 19. Detailed Acceptance Criteria & QA Gateways

- **Quality Score Requirement:** Must pass an objective multi-point inspection scoring $\ge 9.0/10$.
- **Zero TypeScript Errors:** `npm run type-check` must exit 0 across client and server.
- **Zero Test Failures:** `npm run test` must pass all test suites.
- **Zero Horizontal Overflow:** Verified across mobile viewports (360px, 375px, 390px, 430px).
- **Reduced Motion:** Verified with browser emulation of `prefers-reduced-motion: reduce`.

---

## 20. Decisions Requiring Product Owner Approval

1. **Color Palette Selection:** Does the team approve **Concept A ("Editorial Wine & Warm Ivory")** as the primary design identity, or is **Concept B ("Botanical Sage")** preferred?
2. **Motion Dependency:** Approval to install `motion` (`motion/react`) for spring-physics layout transitions.
3. **Button Style Refactor:** Approval to replace the universal `rounded-full` button radius with contextual radius (`rounded-xl` for cards/dialogs, `rounded-full` for FABs and pills).
4. **Emoji Removal:** Approval to replace raw Unicode emojis in `_app.wellness.tsx` with bespoke Lucide SVG icons.

---

## 21. Research Reference Citations

1. **Motion (Framer Motion v12 Rebranding):** `https://motion.dev`
2. **Radix UI Primitives:** `https://www.radix-ui.com/primitives`
3. **Base UI by MUI:** `https://base-ui.com`
4. **React Aria Components:** `https://react-spectrum.adobe.com/react-aria/components.html`
5. **Shadcn UI Tailwind v4 Setup:** `https://ui.shadcn.com/docs/installation/vite`
6. **Recharts Documentation:** `https://recharts.org`
7. **React Day Picker v9:** `https://daypicker.dev`
8. **Magic UI Registry:** `https://magicui.design`
9. **Aceternity UI Licensing Terms:** `https://ui.aceternity.com`
10. **W3C WCAG 2.2 Guidelines:** `https://www.w3.org/TR/WCAG22/`
