# DoseLoop 2.0 — Design System Specification

**Philosophy:** *"Quiet Premium"* — Calm, editorial, life-affirming healthcare interface  
**Inspirations:** Apple Health, Linear, Notion, Arc  
**Accessibility Target:** WCAG 2.2 Level AA  

---

## 1. Creative Direction & Philosophy

Healthcare software is frequently clinical, anxiety-inducing, or overly gamified with neon AI gradients. DoseLoop 2.0 rejects both extremes in favor of **Quiet Premium**:
- **Low-Arousal Warmth:** Warm Ivory (`#faf8f5`) replaces sterile hospital white, calming cognitive load during medication tracking.
- **Dignified Typography:** Plus Jakarta Sans provides friendly authority for display titles; Inter ensures micro-legibility for medical instructions; IBM Plex Sans guarantees tabular alignment for numerals, dosages, and timestamps.
- **Semantic Restraint:** Status indicators use muted sage (on track), amber (action needed), and clay (missed), rather than alarming harsh reds.

---

## 2. Color System & Semantic Tokens

### Light Theme
| Token | Value | Semantic Use |
|---|---|---|
| `--background` | `#faf8f5` (Warm Ivory) | Base page canvas |
| `--foreground` | `#1f2937` (Charcoal) | High-contrast body text (14.2:1 contrast) |
| `--card` | `#ffffff` (Pure White) | Layered surface cards |
| `--primary` | `#0f766e` (Deep Emerald) | Primary actions, key adherence ring |
| `--secondary` | `#84a98c` (Sage Green) | Subtle badges, active secondary tabs |
| `--accent` | `#b8a8e3` (Soft Lavender) | AI badges, wellness reflections |
| `--warning` | `#d4a373` (Warm Gold) | Habit rings, upcoming refill alerts |
| `--destructive` | `#c0492f` (Muted Clay) | Missed doses, emergency actions |
| `--border` | `#e5e7eb` (Mist Grey) | Subtle structural separation |

### Dark Theme
| Token | Value | Semantic Use |
|---|---|---|
| `--background` | `#111827` (Rich Graphite) | Deep non-fatiguing backdrop |
| `--foreground` | `#f8fafc` (Soft White) | Ultra-crisp readable copy |
| `--card` | `#273444` (Charcoal) | Elevated card surface |
| `--primary` | `#34d399` (Vibrant Emerald) | High-visibility primary actions |
| `--secondary` | `#a3be8c` (Sage) | Secondary metadata and tags |
| `--accent` | `#c4b5fd` (Lavender) | Assistant highlight bubbles |
| `--warning` | `#e9c46a` (Warm Gold) | Habit progress |
| `--destructive` | `#f87171` (Coral Red) | Critical reminders |
| `--border` | `#374151` (Slate Grey) | Clean border delineation |

---

## 3. Typography Hierarchy

| Role | Font Family | Size / Line-Height | Weight | Tracking |
|---|---|---|---|---|
| **Display Heading** | Plus Jakarta Sans | `clamp(1.75rem, 3vw, 2.5rem)` | 800 (Extrabold) | `-0.03em` |
| **Page Title** | Plus Jakarta Sans | `1.5rem (24px) / 2rem` | 700 (Bold) | `-0.02em` |
| **Section Title** | Plus Jakarta Sans | `1.125rem (18px) / 1.75rem` | 600 (Semibold) | `-0.01em` |
| **Card Title** | Plus Jakarta Sans | `1.0rem (16px) / 1.5rem` | 600 (Semibold) | `0` |
| **Body (Default)** | Inter | `0.875rem (14px) / 1.5rem` | 400 (Regular) | `0` |
| **Supporting / Meta** | Inter | `0.75rem (12px) / 1rem` | 500 (Medium) | `+0.01em` |
| **Data / Numbers** | IBM Plex Sans | `0.875rem / 1.25rem` | 600 (Semibold) | `tabular-nums` |

---

## 4. Components & Interactive States

1. **Activity & Adherence Rings:**
   - Multi-concentric SVG circles with smooth dashoffset transitions (`transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)`).
   - Color-coded: Primary Emerald (Medications), Info Sage (Hydration), Gold (Daily Habits).
2. **Dose Status Pills (`StatusPill`):**
   - Distinct shape + icon + text combination ensuring status is never conveyed by color alone (WCAG 1.4.1).
   - `Taken` (Check icon, emerald surface), `Upcoming` (Clock icon, neutral outline), `Skipped` (X icon, muted slate).
3. **Buttons:**
   - Height: 44px min for primary targets (Apple Human Interface Guidelines & WCAG 2.5.5 target size).
   - Micro-interaction: `active:scale-[0.98]` with `transition-transform duration-100`.
4. **Theme Persistence:**
   - Zero-flash inline script in `index.html` executing before DOM hydration.
   - Preference stored in `localStorage.getItem('doseloop-theme')`.
   - Supports `light`, `dark`, and `system` modes with seamless OS media query detection.

---

## 5. Motion & Accessibility

- **Reduced Motion:** All keyframe animations and transitions wrap `@media (prefers-reduced-motion: reduce)` with `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;`.
- **Keyboard Navigation:** Explicit visible focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
- **Responsive Constraints:** Fluid layouts tested across viewport widths from 360px (mobile) to 1440px+ (desktop).
