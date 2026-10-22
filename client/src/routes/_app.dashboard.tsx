import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Clock,
  SkipForward,
  AlarmClockOff,
  Plus,
  Pill,
  Droplets,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  Phone,
  IdCard,
  Siren,
  Sparkles,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Activity,
  CheckCircle2,
  HeartHandshake,
  Send,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/app/StatusPill";
import { AiBadge } from "@/components/brand/AiBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export type DoseStatus = "taken" | "skipped" | "snoozed" | "due" | "upcoming";

export interface FamilyPulse {
  id: string;
  name: string;
  relation: string;
  initials: string;
  mood: "great" | "okay" | "low";
  meds: "done" | "due" | "missed";
  hydration: number;
}

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Today — DoseLoop" }] }),
  component: Dashboard,
});

const statusLabel: Record<DoseStatus, string> = {
  taken: "Taken",
  skipped: "Skipped",
  snoozed: "Snoozed",
  due: "Due now",
  upcoming: "Upcoming",
};

function computeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: Sun };
  if (h < 18) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

function formatDateHeader() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

const moodIcon = { great: Smile, okay: Meh, low: Frown } as const;
const moodTone = {
  great: "text-emerald-600 dark:text-emerald-400",
  okay: "text-amber-600 dark:text-amber-400",
  low: "text-muted-foreground",
} as const;

const medsTone: Record<FamilyPulse["meds"], string> = {
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25",
  due: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25",
  missed: "bg-destructive/15 text-destructive border border-destructive/25",
};

function Dashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [waterAmount, setWaterAmount] = useState(1250);
  const [greetingInfo, setGreetingInfo] = useState({ text: "Good morning", icon: Sun });

  useEffect(() => {
    setGreetingInfo(computeGreeting());
  }, []);

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery({
    queryKey: ["/user/profile"],
    queryFn: () => fetcher("/user/profile"),
  });

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery({
    queryKey: ["/dashboard/summary"],
    queryFn: () => fetcher("/dashboard/summary"),
  });

  const {
    data: doses,
    isLoading: dosesLoading,
    isError: dosesError,
  } = useQuery({
    queryKey: ["/doses/today"],
    queryFn: () => fetcher("/doses/today"),
  });

  const doseMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DoseStatus }) =>
      updater(`/doses/${id}`, { status }, "PUT"),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["/doses/today"] });
      const previousDoses = queryClient.getQueryData(["/doses/today"]);
      queryClient.setQueryData(["/doses/today"], (old: unknown) =>
        (old as { id: string }[])?.map((d: { id: string }) => (d.id === id ? { ...d, status } : d)),
      );
      return { previousDoses };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["/doses/today"], context?.previousDoses);
      toast.error("Could not update dose status");
    },
    onSettled: (data, error, variables) => {
      if (!error && variables.status === "taken") {
        trackEvent("reminder_completed");
        toast.success("Dose recorded as taken ✓");
      }
      queryClient.invalidateQueries({ queryKey: ["/doses/today"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/summary"] });
    },
  });

  const waterMutation = useMutation({
    mutationFn: (amountMl: number) => updater("/wellness/water", { amountMl }, "POST"),
    onSuccess: (_, newAmount) => {
      setWaterAmount(newAmount);
      toast.success(`Logged water intake: ${newAmount} ml`);
      queryClient.invalidateQueries({ queryKey: ["/wellness/history"] });
    },
  });

  const quickAddWater = (ml: number) => {
    const next = waterAmount + ml;
    setWaterAmount(next);
    waterMutation.mutate(next);
  };

  const sendReassurancePulse = () => {
    toast.success("Sent reassurance pulse to your Family Circle!", {
      description: "Family members have received an update that you're on track.",
    });
  };

  if (userLoading || summaryLoading || dosesLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="size-8 animate-pulse text-primary" />
          <p className="font-serif text-sm">Preparing your calm morning briefing…</p>
        </div>
      </div>
    );
  }

  if (userError || summaryError || dosesError || !user || !summary || !doses) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card variant="editorial" className="max-w-md p-8 text-center shadow-lift">
          <AlertCircle className="mx-auto size-9 text-destructive" />
          <h2 className="mt-3 font-serif text-xl font-bold text-foreground">
            Couldn't load dashboard
          </h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Please verify server connection and refresh.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl"
            onClick={() => queryClient.invalidateQueries()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const {
    familyHealthScore = { score: 96, delta: "+4%" },
    nextDose,
    familyPulse = [],
  } = summary || {};

  const todaysDoses = Array.isArray(doses) ? doses : [];
  const taken = todaysDoses.filter((d: { status: string }) => d.status === "taken").length;
  const total = todaysDoses.length;
  const adherencePercent = total > 0 ? Math.round((taken / total) * 100) : 0;
  const pulseList = Array.isArray(familyPulse) ? familyPulse : [];

  const update = async (id: string, status: DoseStatus) => {
    doseMutation.mutate({ id, status });
  };

  const filteredDoses = todaysDoses.filter((d: { status: string }) => {
    if (filter === "completed") return d.status === "taken";
    if (filter === "pending") return d.status !== "taken";
    return true;
  });

  const GreetingIcon = greetingInfo.icon;

  return (
    <div className="space-y-6 pb-12 animate-fade">
      {/* Editorial Header with Dynamic Greeting */}
      <header className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Calendar className="size-3.5" />
            <span>{formatDateHeader()}</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
              <GreetingIcon className="size-3.5 text-accent" />
              Day Routine
            </span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greetingInfo.text}, {user.firstName || "Aarav"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {taken} of {total} doses logged today · Family care loop is active and calm.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => quickAddWater(250)}
            className="rounded-xl border-border/90 bg-card hover:bg-sky/20 hover:text-sky-foreground"
          >
            <Droplets className="size-3.5 mr-1.5 text-sky-600 dark:text-sky-400" />
            +250ml Water
          </Button>
          <Button asChild variant="wine" size="sm" className="rounded-xl shadow-soft">
            <Link to="/medications">
              <Plus className="size-3.5 mr-1.5" /> Add Medication
            </Link>
          </Button>
        </div>
      </header>

      {/* 4 Multi-Tinted Purposeful Metric Cards (Rose, Gold, Sky, Sage) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Medication Adherence (Rose Tinted) */}
        <Card variant="rose" className="p-4.5 transition-all hover:shadow-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-foreground/80 dark:text-rose-foreground">
              Medication Adherence
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
              <Pill className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-numeric text-2xl font-bold tracking-tight text-foreground">
                {taken} <span className="text-sm font-normal text-muted-foreground">/ {total}</span>
              </p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {adherencePercent}% completed
              </p>
            </div>
            {/* SVG Progress Ring */}
            <div className="relative size-12 shrink-0">
              <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-muted/60"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-primary transition-all duration-700"
                  strokeDasharray={`${adherencePercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-numeric text-[11px] font-bold text-foreground">
                {adherencePercent}%
              </span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Next Scheduled Dose (Warm Antique Gold Tinted) */}
        <Card variant="gold" className="p-4.5 transition-all hover:shadow-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900/80 dark:text-amber-200">
              Next Scheduled Dose
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <Clock className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            {nextDose ? (
              <>
                <p className="truncate font-serif text-base font-bold text-foreground">
                  {nextDose.medicationName}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs border-amber-500/30 bg-background/60"
                    >
                      {nextDose.time}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{nextDose.inLabel}</span>
                  </div>
                  {todaysDoses.find(
                    (d: { medicationName: string; status: string }) =>
                      d.medicationName === nextDose.medicationName && d.status !== "taken",
                  ) && (
                    <Button
                      size="sm"
                      variant="wine"
                      className="h-6 text-[10px] rounded-lg px-2"
                      onClick={() => {
                        const target = todaysDoses.find(
                          (d: { medicationName: string }) =>
                            d.medicationName === nextDose.medicationName,
                        );
                        if (target) update(target.id, "taken");
                      }}
                    >
                      Take now
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="font-serif text-base font-bold text-emerald-700 dark:text-emerald-400">
                  All caught up!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">No pending doses right now</p>
              </>
            )}
          </div>
        </Card>

        {/* Metric 3: Daily Hydration (Sky Blue Tinted) */}
        <Card variant="sky" className="p-4.5 transition-all hover:shadow-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900/80 dark:text-sky-200">
              Daily Hydration
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-300">
              <Droplets className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="font-numeric text-2xl font-bold tracking-tight text-foreground">
                {waterAmount.toLocaleString()}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 2,000 ml</span>
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => quickAddWater(250)}
                  className="rounded-md bg-sky-500/15 hover:bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-300 transition-colors"
                >
                  +250ml
                </button>
              </div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sky-950/10 dark:bg-sky-950/40">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((waterAmount / 2000) * 100))}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Metric 4: Family Health Score (Sage Tinted) */}
        <Card variant="sage" className="p-4.5 transition-all hover:shadow-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/80 dark:text-emerald-200">
              Family Health Score
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <Smile className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="font-numeric text-2xl font-bold tracking-tight text-foreground">
              {familyHealthScore.score}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
            <Badge className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              {familyHealthScore.delta} this week
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            3 active caregivers in your circle
          </p>
        </Card>
      </section>

      {/* Editorial Clinical Briefing Strip */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-rose/30 to-secondary/30 p-5 sm:p-6 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AiBadge label="Clinical Daily Briefing" />
            <span className="text-xs font-medium text-muted-foreground">8:00 AM Sync</span>
          </div>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            Ask Pulse AI Assistant <ArrowRight className="size-3" />
          </Link>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-foreground font-medium">
          You've logged {taken} of {total} doses so far — blood pressure regimens remain consistent.
          Hydration is currently at {Math.round((waterAmount / 2000) * 100)}% of your target; a
          small 250ml glass of water now closes the gap comfortably.
        </p>
      </section>

      {/* Main Workspace: 2-Column Responsive Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Today's Schedule Timeline */}
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                Today's Regimen Schedule
              </h2>
              <p className="text-xs text-muted-foreground">
                Tap to record dose status or snooze for later reminder
              </p>
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl border border-border/80 bg-background/80 p-1 text-xs font-medium shadow-xs">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-lg px-3 py-1 transition-all",
                  filter === "all"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All ({total})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={cn(
                  "rounded-lg px-3 py-1 transition-all",
                  filter === "pending"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Pending ({total - taken})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={cn(
                  "rounded-lg px-3 py-1 transition-all",
                  filter === "completed"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Completed ({taken})
              </button>
            </div>
          </div>

          {filteredDoses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center shadow-soft">
              <CheckCircle2 className="size-9 text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="font-serif text-base font-bold text-foreground">
                {filter === "completed"
                  ? "No completed doses logged yet today"
                  : "All doses for this view are completed!"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep up the great routine. Regularity ensures quiet peace of mind.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredDoses.map(
                (dose: {
                  id: string;
                  medicationName: string;
                  dosage: string;
                  time: string;
                  status: string;
                  critical?: boolean;
                  instructions?: string;
                }) => {
                  const isDone = dose.status === "taken";
                  const isSkipped = dose.status === "skipped";
                  const isDue = dose.status === "due";

                  return (
                    <li
                      key={dose.id}
                      className={cn(
                        "rounded-2xl border p-4 transition-all duration-200 shadow-soft hover:shadow-lift",
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                          : isDue
                            ? "border-amber-500/50 bg-amber-500/[0.05]"
                            : "border-border/80 bg-card",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Time & Medication Details */}
                        <div className="flex items-center gap-3.5">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold rounded-xl px-2.5 py-2",
                              isDone
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : isDue
                                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                                  : "bg-muted text-foreground",
                            )}
                          >
                            {dose.time}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-serif font-bold text-base text-foreground">
                                {dose.medicationName}
                              </p>
                              <span className="text-xs text-muted-foreground font-medium">
                                · {dose.dosage}
                              </span>
                              {dose.critical && (
                                <Badge className="bg-destructive/15 text-destructive border border-destructive/25 text-[10px] py-0 px-2 font-bold">
                                  Critical
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <StatusPill tone={dose.status as never}>
                                {statusLabel[dose.status as DoseStatus] ?? dose.status}
                              </StatusPill>
                              <span className="text-[11px] text-muted-foreground">
                                Take with water
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Dose Controls */}
                        <div className="flex items-center gap-2">
                          {!isDone && !isSkipped && (
                            <>
                              <Button
                                size="sm"
                                variant="wine"
                                className="rounded-xl shadow-xs"
                                onClick={() => update(dose.id, "taken")}
                              >
                                <Check className="size-3.5 mr-1" /> Take
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl border-border/80 bg-background hover:bg-muted/40"
                                onClick={() => update(dose.id, "snoozed")}
                              >
                                <Clock className="size-3.5 mr-1" /> Snooze
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="size-8 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                                aria-label="Skip dose"
                                onClick={() => update(dose.id, "skipped")}
                              >
                                <SkipForward className="size-3.5" />
                              </Button>
                            </>
                          )}

                          {isDone && (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                <Check className="size-3.5" /> Logged ✓
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[11px] text-muted-foreground hover:text-foreground rounded-lg h-7 px-2"
                                onClick={() => update(dose.id, "upcoming")}
                              >
                                <AlarmClockOff className="size-3 mr-1" /> Undo
                              </Button>
                            </div>
                          )}

                          {isSkipped && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground italic">Skipped</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-[11px] text-muted-foreground hover:text-foreground rounded-lg h-7 px-2"
                                onClick={() => update(dose.id, "taken")}
                              >
                                Take now
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </section>

        {/* Right Column: Family Pulse & Emergency Hub */}
        <aside className="space-y-6">
          {/* Family Care Pulse Card */}
          <Card variant="editorial" className="p-5 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-foreground">
                  Family Care Pulse
                </h3>
                <p className="text-[11px] text-muted-foreground">Synchronized family reassurance</p>
              </div>
              <Link to="/circle" className="text-xs font-bold text-primary hover:underline">
                Circle Hub →
              </Link>
            </div>

            <ul className="mt-3.5 space-y-3">
              {pulseList.map((m: FamilyPulse) => {
                const Mood = moodIcon[m.mood] ?? Smile;
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-2.5 transition-all hover:bg-secondary/30"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-9 border border-border/80 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {m.name}{" "}
                          <span className="font-normal text-muted-foreground">· {m.relation}</span>
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-bold capitalize",
                              medsTone[m.meds],
                            )}
                          >
                            {m.meds}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 font-semibold">
                            <Droplets className="size-2.5" /> {m.hydration}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Mood className={cn("size-4.5 shrink-0", moodTone[m.mood])} />
                  </li>
                );
              })}
            </ul>

            <Button
              variant="outline"
              size="sm"
              onClick={sendReassurancePulse}
              className="mt-4 w-full rounded-xl border-primary/30 text-primary hover:bg-primary/10"
            >
              <Send className="size-3.5 mr-1.5" /> Send Reassurance Pulse
            </Button>
          </Card>

          {/* Emergency Rapid-Access Hub */}
          <div className="rounded-3xl border border-destructive/30 bg-destructive/[0.04] p-5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-destructive/15 text-destructive border border-destructive/25">
                <ShieldAlert className="size-5" />
              </span>
              <div>
                <h3 className="font-serif text-sm font-bold text-foreground">Emergency Hub</h3>
                <p className="text-[11px] text-muted-foreground">
                  Rapid-dispatch contacts & Medical ID
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/emergency"
                className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-2.5 text-xs font-bold text-foreground transition-all hover:border-primary/40 hover:bg-background shadow-xs"
              >
                <Phone className="size-3.5 text-primary" /> Contacts
              </Link>
              <Link
                to="/emergency"
                className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-2.5 text-xs font-bold text-foreground transition-all hover:border-primary/40 hover:bg-background shadow-xs"
              >
                <IdCard className="size-3.5 text-primary" /> Medical ID
              </Link>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a
                href="tel:112"
                aria-label="Call National Emergency 112"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-bold text-white shadow-xs transition-transform active:scale-95 hover:bg-destructive/90"
              >
                <Phone className="size-3.5" /> Call 112 (ERSS)
              </a>
              <Link
                to="/emergency"
                className="inline-flex items-center justify-center rounded-xl border border-destructive/30 bg-card px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                <Siren className="size-3.5 mr-1" /> SOS
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
