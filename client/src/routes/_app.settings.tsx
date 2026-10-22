import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Lock,
  Moon,
  Sun,
  Laptop,
  HeartHandshake,
  Download,
  LogOut,
  Trash2,
  CheckCircle2,
  Shield,
  Eye,
  Sliders,
  Check,
  Smartphone,
  Mail,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — DoseLoop" }] }),
  component: Settings,
});

type SettingsCategory = "appearance" | "notifications" | "privacy" | "data" | "account";

function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SettingsCategory>("appearance");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/user/profile"],
    queryFn: () => fetcher("/user/profile"),
  });

  // Local state initialized with fallback
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: true,
    privacyEnabled: true,
    shareWellness: false,
    criticalEscalation: true,
    largeText: true,
  });

  const showSaveNotice = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const prefsMutation = useMutation({
    mutationFn: (prefs: Record<string, unknown>) => updater("/settings/preferences", prefs, "PUT"),
    onSuccess: () => {
      showSaveNotice("Preferences updated");
      queryClient.invalidateQueries({ queryKey: ["/user/profile"] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => fetcher("/settings/export"),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doseloop_export_${Date.now()}.json`;
      a.click();
      showSaveNotice("Export downloaded");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => updater("/settings/account", {}, "DELETE"),
    onSuccess: async () => {
      await signOut();
      navigate({ to: "/" });
    },
  });

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));

    // Map to backend schema
    if (key === "pushNotifications") prefsMutation.mutate({ pushNotifications: value });
    if (key === "emailNotifications") prefsMutation.mutate({ emailNotifications: value });
    if (key === "privacyEnabled") prefsMutation.mutate({ privacyEnabled: value });
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    prefsMutation.mutate({ theme: newTheme });
    showSaveNotice(`Theme switched to ${newTheme}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading preferences…
      </div>
    );
  }

  const categories = [
    {
      id: "appearance" as const,
      label: "Appearance & Theme",
      icon: Moon,
      desc: "Color modes & typography scale",
    },
    {
      id: "notifications" as const,
      label: "Notifications & Alerts",
      icon: Bell,
      desc: "Dose reminders & quiet hours",
    },
    {
      id: "privacy" as const,
      label: "Privacy & Sharing",
      icon: Lock,
      desc: "Caregiver permissions & encryption",
    },
    {
      id: "data" as const,
      label: "Data & Backup",
      icon: Download,
      desc: "Personal records export & storage",
    },
    {
      id: "account" as const,
      label: "Account & Support",
      icon: Sliders,
      desc: "Support, feedback & security",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Preferences & System"
          title="Settings"
          description="Refined controls for display aesthetics, quiet notifications, and caregiver privacy."
        />
        {saveStatus && (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs animate-in fade-in">
            <Check className="size-3.5" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Structured Desktop Two-Column Arrangement / Mobile Tabs */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        {/* Navigation Rail */}
        <nav className="flex flex-row gap-1.5 overflow-x-auto rounded-2xl border border-border/80 bg-card p-2 shadow-soft lg:flex-col lg:overflow-visible">
          {categories.map((c) => {
            const isActive = activeTab === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all shrink-0 lg:w-full",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <c.icon className="size-4 shrink-0" />
                <div className="hidden lg:block min-w-0">
                  <p className="text-xs leading-none">{c.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px] truncate",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground/75",
                    )}
                  >
                    {c.desc}
                  </p>
                </div>
                <span className="lg:hidden text-xs">{c.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content Panel */}
        <div className="space-y-6">
          {/* Category: Appearance & Theme */}
          {activeTab === "appearance" && (
            <section className="space-y-6 animate-in fade-in">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-6">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">Color Theme</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose between the tailored Editorial Warm Ivory light theme and Luxury Obsidian
                    dark theme.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Light Theme Card */}
                  <div
                    onClick={() => handleThemeChange("light")}
                    className={cn(
                      "cursor-pointer rounded-2xl border-2 p-4 transition-all shadow-xs",
                      theme === "light"
                        ? "border-primary bg-primary/[0.04]"
                        : "border-border/80 bg-background/50 hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="size-4 text-amber-600" />
                        <span className="text-xs font-bold text-foreground">
                          Warm Ivory (Light)
                        </span>
                      </div>
                      {theme === "light" && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                    {/* Visual Preview */}
                    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-[#F7F5F0] p-2.5 space-y-1.5">
                      <div className="h-3 w-1/3 rounded bg-[#722F37]" />
                      <div className="h-2 w-full rounded bg-[#E4DED5]" />
                      <div className="h-2 w-2/3 rounded bg-[#E4DED5]" />
                    </div>
                    <p className="mt-2.5 text-[11px] text-muted-foreground">
                      Comfortable paper background with deep wine typography.
                    </p>
                  </div>

                  {/* Dark Theme Card */}
                  <div
                    onClick={() => handleThemeChange("dark")}
                    className={cn(
                      "cursor-pointer rounded-2xl border-2 p-4 transition-all shadow-xs",
                      theme === "dark"
                        ? "border-primary bg-primary/[0.04]"
                        : "border-border/80 bg-background/50 hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="size-4 text-rose-400" />
                        <span className="text-xs font-bold text-foreground">
                          Obsidian Rose (Dark)
                        </span>
                      </div>
                      {theme === "dark" && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                    {/* Visual Preview */}
                    <div className="mt-3 overflow-hidden rounded-xl border border-[#383033] bg-[#161314] p-2.5 space-y-1.5">
                      <div className="h-3 w-1/3 rounded bg-[#E8868E]" />
                      <div className="h-2 w-full rounded bg-[#383033]" />
                      <div className="h-2 w-2/3 rounded bg-[#383033]" />
                    </div>
                    <p className="mt-2.5 text-[11px] text-muted-foreground">
                      Warm espresso charcoal with soft rose wine highlights.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      Comfort Typography Scale
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Enlarges medication dosage labels and touch targets for effortless reading.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.largeText}
                    onCheckedChange={(v) => handleToggle("largeText", v)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Category: Notifications & Alerts */}
          {activeTab === "notifications" && (
            <section className="space-y-6 animate-in fade-in">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Notification Policy
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    DoseLoop enforces a strictly quiet device policy — zero marketing nudges, only
                    essential care alerts.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Push Dose Reminders</p>
                      <p className="text-[11px] text-muted-foreground">
                        Real-time notification at scheduled dose times with quick 1-tap logging.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(v) => handleToggle("pushNotifications", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Daily Morning Digest</p>
                      <p className="text-[11px] text-muted-foreground">
                        Single daily summary at 8:00 AM recapping family adherence and hydration
                        targets.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(v) => handleToggle("emailNotifications", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        Critical Missed Escalation
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Notify emergency contacts if a critical medication is unconfirmed 90 minutes
                        after schedule.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.criticalEscalation}
                      onCheckedChange={(v) => handleToggle("criticalEscalation", v)}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Category: Privacy & Sharing */}
          {activeTab === "privacy" && (
            <section className="space-y-6 animate-in fade-in">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Consent & Caregiver Sharing
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control the granularity of what your connected Family Circle members can
                    observe.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        Synthesized Status Only
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Caregivers receive calm synthesized status ('On Track' / 'Needs check-in')
                        rather than invasive raw logs.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.privacyEnabled}
                      onCheckedChange={(v) => handleToggle("privacyEnabled", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        Share Wellness & Hydration
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Permit caregivers to see water intake progress and daily energy/sleep logs.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.shareWellness}
                      onCheckedChange={(v) => handleToggle("shareWellness", v)}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <Shield className="size-4 shrink-0 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Zero clinical health data is sold or shared with third parties. Pulse AI
                    conversations are processed in private ephemeral memory.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Category: Data & Backup */}
          {activeTab === "data" && (
            <section className="space-y-6 animate-in fade-in">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Personal Health Records
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your health data belongs entirely to you. Export complete JSON logs at any time.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Export Complete Records
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Includes active medication regimens, dose timestamps, hydration logs, and
                        caregiver circle data.
                      </p>
                    </div>
                    <Button
                      variant="wine"
                      size="sm"
                      className="rounded-xl shadow-xs shrink-0"
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="size-3.5 mr-1.5" />
                      {exportMutation.isPending ? "Generating…" : "Export JSON"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Database Sync Status</p>
                    <p className="text-[11px] text-muted-foreground">
                      PostgreSQL cluster synced · Zero pending offline records
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px]">
                    Operational
                  </Badge>
                </div>
              </div>
            </section>
          )}

          {/* Category: Account & Support */}
          {activeTab === "account" && (
            <section className="space-y-6 animate-in fade-in">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Account Actions & Support
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get in touch with our team or safely manage your active credentials.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Help & Feedback</p>
                      <p className="text-[11px] text-muted-foreground">
                        Report a regimen issue or suggest a feature to our team.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-border bg-card shrink-0"
                      onClick={() => navigate({ to: "/help" })}
                    >
                      <HeartHandshake className="size-3.5 mr-1.5 text-primary" /> Open Help Desk
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 p-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Active Session</p>
                      <p className="text-[11px] text-muted-foreground">
                        Signed in as {user?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-3.5 mr-1.5" /> Sign Out
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-destructive/25 bg-destructive/[0.03] p-4">
                    <div>
                      <p className="text-xs font-semibold text-destructive">
                        Danger Zone: Delete Account
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Permanently purge your account, medications, and caregiver relationships.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive/10 shrink-0 text-xs"
                        >
                          <Trash2 className="size-3.5 mr-1.5" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-border/80 bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-serif">
                            Permanently Delete Account?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All medication schedules, adherence logs,
                            and family connections will be erased immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAccountMutation.mutate()}
                            className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
                          >
                            Yes, delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
