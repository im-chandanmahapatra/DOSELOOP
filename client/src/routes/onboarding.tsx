import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Pill, Users, Bell, Check, HeartPulse, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — DoseLoop" }] }),
  component: Onboarding,
});

const steps = [
  {
    icon: HeartPulse,
    title: "Who are we caring for?",
    subtitle: "Start with yourself — you can add family to your Circle later.",
  },
  {
    icon: Pill,
    title: "Add your first medication",
    subtitle: "Just the essentials. You can refine the schedule any time.",
  },
  {
    icon: Bell,
    title: "How should we remind you?",
    subtitle: "Calm by default. One shared daily budget, never noise.",
  },
  {
    icon: Users,
    title: "You're all set",
    subtitle: "Your loop is ready. Invite family whenever you're comfortable.",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [reminder, setReminder] = useState("push");
  const last = step === steps.length - 1;
  const Current = steps[step].icon;

  const next = () => (last ? navigate({ to: "/dashboard" }) : setStep((s) => s + 1));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-fade">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10 border-b border-border/60">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
            <Link to="/dashboard">Skip for now</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
        {/* Step Progress Pills */}
        <div className="mb-10 flex items-center gap-2" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i <= step ? "bg-primary shadow-xs" : "bg-border/80",
              )}
            />
          ))}
        </div>

        <Card variant="editorial" className="p-8 sm:p-10 shadow-lift">
          <div className="space-y-6">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-soft">
              <Current className="size-7" />
            </span>
            <div className="space-y-1.5">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                {steps[step].title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {steps[step].subtitle}
              </p>
            </div>

            {step === 0 && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold">Your name</Label>
                  <Input id="name" defaultValue="Aarav Sharma" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-bold">What brings you to DoseLoop?</Label>
                  <Input id="role" defaultValue="Managing my daily health & reassuring my family" className="rounded-xl" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="med" className="text-xs font-bold">Medication name</Label>
                  <Input id="med" placeholder="e.g. Lisinopril" defaultValue="Metformin" className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dose" className="text-xs font-bold">Dosage</Label>
                    <Input id="dose" placeholder="500 mg" defaultValue="500 mg" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="text-xs font-bold">Time</Label>
                    <Input id="time" type="time" defaultValue="08:00" className="rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 pt-2">
                {[
                  { id: "push", label: "Push notifications", hint: "Gentle, one-tap to log" },
                  { id: "inapp", label: "In-app only", hint: "Quiet — check on your own time" },
                  { id: "digest", label: "Daily digest only", hint: "One calm summary each morning" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReminder(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                      reminder === opt.id
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border/80 bg-card hover:border-primary/40",
                    )}
                  >
                    <span>
                      <span className="block font-serif font-bold text-sm text-foreground">{opt.label}</span>
                      <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                    </span>
                    {reminder === opt.id && (
                      <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <span className="grid size-12 place-items-center mx-auto rounded-full bg-emerald-600 text-white shadow-soft">
                  <Check className="size-6" />
                </span>
                <h3 className="font-serif font-bold text-lg text-emerald-900 dark:text-emerald-200">
                  Your care loop is active!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Your first gentle reminder is scheduled for 8:00 AM tomorrow. We keep it serene — promise.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="rounded-xl">
                  <ArrowLeft className="size-4 mr-1" /> Back
                </Button>
              )}
              <Button onClick={next} variant="wine" size="lg" className="ml-auto rounded-2xl shadow-soft">
                {last ? "Enter Today's Dashboard" : "Continue"}
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
