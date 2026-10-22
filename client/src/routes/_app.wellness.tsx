import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  Droplets,
  Frown,
  Meh,
  Smile,
  Heart,
  Sparkles,
  Moon,
  CheckCircle2,
  Activity,
  HeartPulse,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";

export const Route = createFileRoute("/_app/wellness")({
  head: () => ({ meta: [{ title: "Wellness — DoseLoop" }] }),
  component: Wellness,
});

const moodOptions = [
  { id: 1, label: "Rough", icon: Frown, tone: "text-destructive border-destructive/30 bg-destructive/8" },
  { id: 2, label: "Low", icon: Meh, tone: "text-amber-600 border-amber-500/30 bg-amber-500/8" },
  { id: 3, label: "Okay", icon: Smile, tone: "text-muted-foreground border-border bg-secondary/50" },
  { id: 4, label: "Good", icon: Heart, tone: "text-emerald-700 border-emerald-500/30 bg-emerald-500/8" },
  { id: 5, label: "Vibrant", icon: Sparkles, tone: "text-primary border-primary/30 bg-primary/8" },
];

function Wellness() {
  const queryClient = useQueryClient();
  const [localMood, setLocalMood] = useState(4);
  const [localWater, setLocalWater] = useState(1500);
  const [sleepHours, setSleepHours] = useState(7.5);

  // Vitals state
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("78");
  const [heartRate, setHeartRate] = useState("72");
  const [bloodGlucose, setBloodGlucose] = useState("95");

  const { data: history = { moods: [], waterLogs: [] }, isLoading } = useQuery({
    queryKey: ["/wellness/history"],
    queryFn: () => fetcher("/wellness/history"),
  });

  const moodMutation = useMutation({
    mutationFn: (moodValue: number) =>
      updater("/wellness/metric", {
        label: "Mood",
        icon: "smile",
        value: moodValue,
        unit: "scale",
      }),
    onSuccess: () => {
      toast.success("Mood recorded and shared with Care Circle");
      queryClient.invalidateQueries({ queryKey: ["/wellness/history"] });
    },
  });

  const waterMutation = useMutation({
    mutationFn: (amountMl: number) => updater("/wellness/water", { amountMl }),
    onSuccess: () => {
      toast.success("Water intake updated ✓");
      queryClient.invalidateQueries({ queryKey: ["/wellness/history"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/summary"] });
    },
  });

  const vitalsMutation = useMutation({
    mutationFn: (data: { systolic: number; diastolic: number; heartRate: number; glucose: number }) =>
      updater("/wellness/vitals", data, "POST"),
    onSuccess: () => {
      toast.success("Vitals logged successfully ✓");
      queryClient.invalidateQueries({ queryKey: ["/wellness/history"] });
    },
  });

  const stepWater = (delta: number) => {
    const newVal = Math.max(0, localWater + delta);
    setLocalWater(newVal);
    waterMutation.mutate(newVal);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    vitalsMutation.mutate({
      systolic: parseInt(systolic) || 120,
      diastolic: parseInt(diastolic) || 80,
      heartRate: parseInt(heartRate) || 72,
      glucose: parseInt(bloodGlucose) || 95,
    });
  };

  const waterGoal = 2000;
  const waterPct = Math.min(100, Math.round((localWater / waterGoal) * 100));

  // Compute BP clinical guidance
  const sysNum = parseInt(systolic) || 120;
  const diaNum = parseInt(diastolic) || 80;
  let bpCategory = { label: "Normal", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25" };
  if (sysNum >= 140 || diaNum >= 90) {
    bpCategory = { label: "Stage 2 Hypertension", tone: "bg-destructive/15 text-destructive border-destructive/25" };
  } else if (sysNum >= 130 || diaNum >= 80) {
    bpCategory = { label: "Stage 1 Hypertension", tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/25" };
  } else if (sysNum >= 120 && diaNum < 80) {
    bpCategory = { label: "Elevated", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" };
  }

  return (
    <div className="space-y-8 pb-12 animate-fade">
      <PageHeader
        eyebrow="Gentle Self-Care"
        title="Daily Wellness & Vitality"
        description="Record hydration, emotional comfort, sleep, and cardiovascular vitals in one serene space — zero intrusive alarms."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Hydration Card (Sky blue tint) */}
        <Card variant="sky" className="p-6 sm:p-8 flex flex-col justify-between shadow-soft">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2.5 font-serif text-lg font-bold text-foreground">
                <span className="grid size-10 place-items-center rounded-2xl bg-sky-500/20 text-sky-700 dark:text-sky-300">
                  <Droplets className="size-5" />
                </span>
                Hydration Rhythm
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-card border border-border/80 text-foreground">
                Target: {waterGoal} ml
              </span>
            </div>

            <div className="my-8 flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => stepWater(-250)}
                aria-label="Decrease 250 ml"
                className="rounded-2xl size-12 border-border/90 bg-card hover:bg-secondary"
              >
                <Minus className="size-5" />
              </Button>

              <div className="text-center">
                <span className="font-numeric block text-5xl font-extrabold text-foreground tracking-tight">
                  {localWater.toLocaleString()}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  milliliters logged
                </span>
              </div>

              <Button
                variant="wine"
                size="icon"
                onClick={() => stepWater(250)}
                aria-label="Increase 250 ml"
                className="rounded-2xl size-12 shadow-soft"
              >
                <Plus className="size-5" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{waterPct}% of daily target</span>
                <span>{waterGoal - localWater > 0 ? `${waterGoal - localWater} ml remaining` : "Daily target reached! 🎉"}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sky-950/15 dark:bg-sky-950/40">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="mt-6 flex gap-2 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => stepWater(250)}
              className="flex-1 text-xs rounded-xl border-border bg-card hover:bg-sky/20"
            >
              +250ml Glass
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => stepWater(500)}
              className="flex-1 text-xs rounded-xl border-border bg-card hover:bg-sky/20"
            >
              +500ml Bottle
            </Button>
          </div>
        </Card>

        {/* Sleep & Rest Card (Lavender / Gold Tint) */}
        <Card variant="gold" className="p-6 sm:p-8 flex flex-col justify-between shadow-soft">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2.5 font-serif text-lg font-bold text-foreground">
                <span className="grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  <Moon className="size-5" />
                </span>
                Rest & Recovery
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-card border border-border/80 text-foreground">
                Last Night
              </span>
            </div>

            <div className="my-8 text-center">
              <span className="font-numeric block text-5xl font-extrabold text-foreground tracking-tight">
                {sleepHours}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                hours of restful sleep
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-xs mx-auto">
              Consistent sleep improves medication metabolism and helps stabilize systolic blood pressure.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSleepHours((s) => Math.max(4, s - 0.5))}
              className="rounded-xl text-xs bg-card border-border/80"
            >
              - 30m
            </Button>
            <span className="text-xs font-bold text-foreground px-2">Adjust Duration</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSleepHours((s) => Math.min(12, s + 0.5))}
              className="rounded-xl text-xs bg-card border-border/80"
            >
              + 30m
            </Button>
          </div>
        </Card>

        {/* Vital Signs Logging Station (Blood Pressure & Heart Rate) */}
        <Card variant="editorial" className="p-6 sm:p-8 shadow-soft sm:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="size-5 text-primary" />
                <h3 className="font-serif text-lg font-bold text-foreground">Cardiovascular Vitals Station</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Record today's blood pressure and resting pulse for clinical records.
              </p>
            </div>
            <Badge className={cn("text-xs font-bold border", bpCategory.tone)}>
              AHA Category: {bpCategory.label}
            </Badge>
          </div>

          <form onSubmit={handleSaveVitals} className="mt-6 grid gap-4 sm:grid-cols-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="bp-sys" className="text-xs font-bold">Systolic (mmHg)</Label>
              <Input
                id="bp-sys"
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="font-numeric text-base rounded-xl font-bold"
                placeholder="120"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bp-dia" className="text-xs font-bold">Diastolic (mmHg)</Label>
              <Input
                id="bp-dia"
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="font-numeric text-base rounded-xl font-bold"
                placeholder="80"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hr" className="text-xs font-bold">Heart Rate (BPM)</Label>
              <Input
                id="hr"
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="font-numeric text-base rounded-xl font-bold"
                placeholder="72"
              />
            </div>

            <Button type="submit" variant="wine" className="rounded-xl shadow-soft">
              <Save className="size-4 mr-1.5" /> Save Vitals
            </Button>
          </form>
        </Card>

        {/* Mood Assessment Card */}
        <Card variant="editorial" className="p-6 sm:p-8 shadow-soft sm:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">How are you feeling today?</h3>
              <p className="text-xs text-muted-foreground">
                Helps your Family Circle understand your comfort level without intrusive calls.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              Shared with Circle
            </span>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-3">
            {moodOptions.map((m) => {
              const Icon = m.icon;
              const selected = localMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setLocalMood(m.id);
                    moodMutation.mutate(m.id);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-lift scale-102"
                      : "border-border/80 bg-background hover:border-primary/40 hover:bg-secondary/40 text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={selected}
                >
                  <Icon className={cn("size-6 sm:size-7", selected ? "text-primary-foreground" : "")} />
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
