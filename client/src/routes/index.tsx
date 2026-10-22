import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Pill,
  Users,
  Sparkles,
  HeartPulse,
  ShieldCheck,
  Bell,
  ArrowRight,
  Check,
  Clock,
  Heart,
  ChevronRight,
  CheckCircle2,
  Lock,
  PhoneCall,
  Droplets,
  Shield,
  Activity,
  Smile,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AiBadge } from "@/components/brand/AiBadge";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DoseLoop — Calm family health, together" },
      {
        name: "description",
        content:
          "DoseLoop keeps families gently in sync on medications, wellness, and peace of mind — proactive, private, and beautifully simple.",
      },
      { property: "og:title", content: "DoseLoop — Calm family health, together" },
      {
        property: "og:description",
        content: "An AI-powered family health companion built around trust, not surveillance.",
      },
      { property: "og:image", content: heroImage },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: Landing,
});

const principles = [
  "Consent is non-negotiable — you choose exactly what is shared",
  "Calm over clever — zero alarmist banners or noisy alerts",
  "Accessible to all generations — high contrast and generous touch targets",
];

const faqs = [
  {
    q: "How does the Family Circle protect patient dignity?",
    a: "Unlike surveillance apps that broadcast every private action, DoseLoop's Circle shares only high-level reassurance states (e.g., 'Dad is on track today') rather than raw medical logs. The patient has granular control to toggle medication or wellness sharing per member at any time.",
  },
  {
    q: "What happens if a critical dose is missed?",
    a: "DoseLoop avoids panic. If a critical medication is not logged after a gentle grace period, a quiet nudge is surfaced to the patient first. If configured, designated family caregivers receive a discrete check-in reminder rather than an emergency alarm.",
  },
  {
    q: "Does DoseLoop sell or share our health data?",
    a: "Never. Your personal health records, dosage schedules, and caregiver circle data are encrypted both in transit (TLS 1.3) and at rest (AES-256). We do not monetize data, sell advertising, or share health records with insurers.",
  },
  {
    q: "Can I use DoseLoop offline?",
    a: "Yes. DoseLoop's progressive architecture logs doses locally on your device immediately. When connectivity resumes, logs synchronize seamlessly with your private database.",
  },
  {
    q: "Can I export records for my doctor?",
    a: "Absolutely. With one tap in Settings, you can generate a clean, chronological health and adherence summary to bring to clinical appointments.",
  },
];

function InteractiveHeroSimulator() {
  const [doses, setDoses] = useState([
    { id: 1, name: "Metformin", dose: "500mg", time: "8:00 AM", taken: true, color: "#7A2E38" },
    { id: 2, name: "Lisinopril", dose: "10mg", time: "1:00 PM", taken: false, color: "#B89450" },
    { id: 3, name: "Atorvastatin", dose: "20mg", time: "8:00 PM", taken: false, color: "#2B7050" },
  ]);

  const takenCount = doses.filter((d) => d.taken).length;
  const pct = Math.round((takenCount / doses.length) * 100);

  const toggleDose = (id: number) => {
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, taken: !d.taken } : d)));
  };

  return (
    <div className="relative mx-auto w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-float transition-all hover:shadow-lift">
      {/* Simulator header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Live Preview · Tap to Experience
          </span>
          <h3 className="font-serif text-lg font-bold text-foreground">Today's Regimen</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-numeric text-xs font-bold text-foreground">{pct}% Complete</span>
          <div className="relative size-7">
            <svg className="size-7 -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-muted"
                strokeWidth="4"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-primary transition-all duration-500"
                strokeDasharray={`${pct}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Doses List */}
      <div className="mt-4 space-y-2.5">
        {doses.map((d) => (
          <div
            key={d.id}
            onClick={() => toggleDose(d.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDose(d.id);
              }
            }}
            className={`group flex items-center justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
              d.taken
                ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                : "border-border/70 bg-background/60 hover:border-primary/40 hover:bg-secondary/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid size-9 place-items-center rounded-xl transition-all ${
                  d.taken
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                }`}
              >
                {d.taken ? <Check className="size-4" /> : <Pill className="size-4" />}
              </span>
              <div>
                <p className="font-serif font-bold text-sm leading-tight text-foreground">
                  {d.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{d.dose}</span>
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="size-3" />
                  {d.time}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                d.taken
                  ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                  : "bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
            >
              {d.taken ? "Taken ✓" : "Tap to Log"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border/60">
        <span className="flex items-center gap-1.5 text-primary font-bold">
          <Sparkles className="size-3.5" />
          Interactive Demo — click any dose
        </span>
        <span>Aarav's Schedule</span>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/15 selection:text-primary">
      {/* Sticky Header */}
      <header className="glass sticky top-0 z-30 border-b border-border/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pillars" className="transition-colors hover:text-foreground">
              Pillars of Calm
            </a>
            <a href="#circle" className="transition-colors hover:text-foreground">
              Family Circle
            </a>
            <a href="#compare" className="transition-colors hover:text-foreground">
              Comparison
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-xl">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild variant="wine" size="sm" className="rounded-xl shadow-soft">
              <Link to="/onboarding">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="surface-glow relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute -left-20 top-12 size-96 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 top-20 size-80 rounded-full bg-accent/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="animate-rise space-y-6 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
              <ShieldCheck className="size-4" />
              Peace of mind is the product
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.08] font-serif">
              Calm family health,{" "}
              <span className="text-primary italic font-serif">held together</span> with quiet
              precision.
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
              DoseLoop helps chronic patients and the families who love them stay on top of daily
              medications and wellness — with gentle reminders, private caregiver updates, and zero
              alarmist noise.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="wine" size="lg" className="rounded-2xl shadow-lift">
                <Link to="/onboarding">
                  Start your loop
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl bg-card border-border/80"
              >
                <Link to="/dashboard">Explore interactive dashboard</Link>
              </Button>
            </div>

            <ul className="grid gap-2.5 pt-3">
              {principles.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground font-medium"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <Check className="size-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-rise-slow lg:col-span-5">
            <InteractiveHeroSimulator />
          </div>
        </div>
      </section>

      {/* The Three Pillars of Calm (Multi-Tinted Cards: Rose, Gold, Sage) */}
      <section id="pillars" className="border-b border-border/60 py-20 sm:py-28 bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl text-left" data-reveal>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Philosophy
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Three Pillars of Dignified Care
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Designed specifically to replace stressful hospital portals and noisy reminder apps
              with serenity.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Pillar 1: Rose Tinted */}
            <Card
              variant="rose"
              className="p-7 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all"
            >
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Bell className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold text-foreground">
                  Zero Alarm Fatigue
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Gentle ambient notifications that respect human routines. No blaring klaxons,
                  guilt-tripping popups, or punitive counters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-rose/30 text-xs font-bold text-primary">
                Gentle Nudges · Adaptive Windows
              </div>
            </Card>

            {/* Pillar 2: Gold Tinted */}
            <Card
              variant="gold"
              className="p-7 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all"
            >
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  <Users className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold text-foreground">
                  Reassurance Without Nagging
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Caregivers see high-level peace-of-mind states ('Dad is on track today') without
                  invading personal medical records or triggering intrusive calls.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gold/30 text-xs font-bold text-amber-900 dark:text-amber-200">
                Granular Consent · Revocable Anytime
              </div>
            </Card>

            {/* Pillar 3: Sage Tinted */}
            <Card
              variant="sage"
              className="p-7 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all"
            >
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold text-foreground">
                  Clinical Readiness & SOS
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Instant Emergency Medical ID with documented allergies, active prescriptions, and
                  one-tap paramedic dispatch accessible even offline.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sage/30 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Paramedic Passport · GPS Dispatch
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="border-b border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl" data-reveal>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Thoughtful Architecture
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything your family needs. Nothing it doesn't.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Engineered to replace cluttered pill organizers, chaotic family text threads, and
              stressful alert apps with one serene, synchronized rhythm.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Bento 1: Large Span */}
            <Card
              variant="editorial"
              className="sm:col-span-2 p-8 shadow-soft transition-all hover:shadow-lift"
            >
              <div className="flex flex-col justify-between h-full gap-6 lg:flex-row lg:items-center">
                <div className="space-y-4 max-w-md">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Users className="size-6" />
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    A Family Circle, not surveillance
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Invite trusted caregivers and family members with fine-grained visibility
                    controls. Ananya sees that Dad took his morning medication without intruding on
                    his medical logs. Consent is non-negotiable and revocable anytime.
                  </p>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-border">
                    <Link to="/circle">Learn about Circle permissions →</Link>
                  </Button>
                </div>

                <div className="w-full lg:max-w-xs rounded-2xl border border-border/80 bg-background/90 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold text-foreground">Caregiver View</span>
                    <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                      Reassurance Only
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-foreground">Ayush (Dad)</p>
                    <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Both critical morning doses confirmed
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bento 2: Precision Timing */}
            <Card variant="editorial" className="p-8 shadow-soft transition-all hover:shadow-lift">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300">
                <Pill className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold text-foreground">
                Medications that never slip
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Handle multi-dose schedules, complicated tapering, and automatic refill alerts.
                One-tap logging from your phone, watch, or desktop.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs px-2.5 py-1 font-bold">
                  Taken ✓
                </span>
                <span className="rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 font-bold">
                  Due in 15m
                </span>
                <span className="rounded-full bg-muted text-muted-foreground border border-border text-xs px-2.5 py-1 font-semibold">
                  Upcoming
                </span>
              </div>
            </Card>

            {/* Bento 3: AI Assistant */}
            <Card variant="editorial" className="p-8 shadow-soft transition-all hover:shadow-lift">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold text-foreground">
                Pulse AI: Reassuring Companion
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Powered by Groq's high-speed inference. Ask contextual questions like "Can I take
                Metformin with food?" and receive clear, evidence-backed guidance.
              </p>
              <div className="mt-6">
                <AiBadge label="Clinical assistant mode" />
              </div>
            </Card>

            {/* Bento 4: Unified Household Wellness */}
            <Card
              variant="editorial"
              className="sm:col-span-2 p-8 shadow-soft transition-all hover:shadow-lift"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                <div className="space-y-3 max-w-md">
                  <span className="grid size-12 place-items-center rounded-2xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
                    <HeartPulse className="size-6" />
                  </span>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Household wellness in one shared rhythm
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Track hydration, mood, and sleep patterns together. When an elderly parent feels
                    unwell, the family knows without intrusive interrogations.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center rounded-2xl border border-border/80 bg-background/80 p-4 min-w-28 shadow-xs">
                    <p className="font-numeric text-2xl font-bold text-primary">2,250</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      ml Water Logged
                    </p>
                  </div>
                  <div className="text-center rounded-2xl border border-border/80 bg-background/80 p-4 min-w-28 shadow-xs">
                    <p className="font-numeric text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      100%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Adherence Streak
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section: DoseLoop vs Cluttered Portals vs Habit Apps */}
      <section id="compare" className="border-b border-border/60 py-20 sm:py-28 bg-secondary/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              A Clear Choice
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Families Choose DoseLoop
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground">
              Compare the DoseLoop standard against conventional clinical portals and noisy apps.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/80">
                  <th className="py-4 px-4 font-serif font-bold text-foreground">Core Dimension</th>
                  <th className="py-4 px-4 font-bold text-primary bg-primary/5 rounded-t-2xl">
                    DoseLoop 2.0
                  </th>
                  <th className="py-4 px-4 font-semibold text-muted-foreground">
                    Hospital EHR Portals
                  </th>
                  <th className="py-4 px-4 font-semibold text-muted-foreground">
                    Gamified Habit Apps
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Caregiver Sync</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">
                    Dignified Reassurance states
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">None (patient-only login)</td>
                  <td className="py-3.5 px-4 text-muted-foreground">Overbearing surveillance</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Alert Philosophy</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">
                    Calm, adaptive grace periods
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Chaotic email notifications</td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    Piercing alarms & streaks guilt
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Medical ID / SOS</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">
                    1-Tap GPS & Paramedic Passport
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Buried behind 2FA portals</td>
                  <td className="py-3.5 px-4 text-muted-foreground">Not supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-foreground">Data Privacy</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">
                    Zero ads · AES-256 Encrypted
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    Legacy institutional servers
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">Ad-monetized data brokers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Caregiver Narrative */}
      <section id="circle" className="border-b border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card variant="editorial" className="p-8 sm:p-12 shadow-lift">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Caregiver Story
                </span>
                <blockquote className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-foreground">
                  "I used to start every phone call with 'did you remember your blood-pressure
                  pill?' Now DoseLoop tells me Dad is okay quietly. Our calls are back to talking
                  about cricket."
                </blockquote>
                <div>
                  <p className="font-bold text-foreground">Ananya Iyer</p>
                  <p className="text-xs text-muted-foreground">
                    Long-distance daughter & caregiver
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-secondary/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-soft">
                    A
                  </span>
                  <div>
                    <p className="font-bold text-sm">Ayush Iyer (Dad)</p>
                    <p className="text-xs text-muted-foreground">Sharing Wellness & Daily Doses</p>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>On track today · All scheduled doses confirmed</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust & Security */}
      <section
        id="trust"
        className="border-b border-border/60 bg-primary/5 py-20 sm:py-24 text-center"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="grid size-14 place-items-center mx-auto rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-soft">
            <Lock className="size-7" />
          </span>
          <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built on non-negotiable security & trust
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-base leading-relaxed text-muted-foreground">
            Healthcare data requires the highest ethical standard. Zero advertising, zero data
            brokers, and complete cryptographic data sovereignty.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <ShieldCheck className="size-5 text-primary" />
              <h4 className="mt-3 font-serif font-bold text-base text-foreground">
                End-to-End Encrypted
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">
                Encrypted at rest with AES-256 and in transit with TLS 1.3 standards.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <Users className="size-5 text-accent" />
              <h4 className="mt-3 font-serif font-bold text-base text-foreground">
                Strict Patient Consent
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">
                Family members only see what you explicitly authorize. Revocable anytime.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <PhoneCall className="size-5 text-destructive" />
              <h4 className="mt-3 font-serif font-bold text-base text-foreground">
                One-Tap Emergency SOS
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">
                Instant emergency medical ID access and designated caregiver alerting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="border-b border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center" data-reveal>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Questions & Answers
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-2xl border border-border/80 bg-card px-5 shadow-xs"
                >
                  <AccordionTrigger className="text-left font-serif font-bold text-foreground hover:no-underline hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm leading-relaxed text-muted-foreground pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 sm:py-24 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Give your family the gift of peace of mind today.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Free for individuals and families. Set up your medication schedule in under two minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button asChild variant="wine" size="lg" className="rounded-2xl shadow-lift">
              <Link to="/onboarding">
                Start your loop for free
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl bg-card border-border/80"
            >
              <Link to="/auth">Sign into existing account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Rich 4-Column Footer */}
      <footer className="border-t border-border/80 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <Logo size="sm" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                DoseLoop is an AI-powered medication and family wellness companion built to bring
                serenity, adherence, and dignity to household healthcare.
              </p>
              <p className="text-[11px] text-muted-foreground/75">
                © {new Date().getFullYear()} DoseLoop Health Technologies Inc.
              </p>
            </div>

            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Features
              </h5>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>
                  <Link to="/dashboard" className="hover:text-primary">
                    Today Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/medications" className="hover:text-primary">
                    Medication Engine
                  </Link>
                </li>
                <li>
                  <Link to="/circle" className="hover:text-primary">
                    Family Circle
                  </Link>
                </li>
                <li>
                  <Link to="/assistant" className="hover:text-primary">
                    Pulse AI Assistant
                  </Link>
                </li>
                <li>
                  <Link to="/emergency" className="hover:text-primary">
                    Emergency SOS
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Resources
              </h5>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>
                  <Link to="/help" className="hover:text-primary">
                    Help & Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="hover:text-primary">
                    Privacy & Data Export
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-primary">
                    Account Management
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Medical Disclaimer
              </h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                DoseLoop provides schedule tracking and general educational information. It is not a
                certified medical diagnostic device and does not substitute for professional
                physician guidance or emergency 112 / ambulance dispatch.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
