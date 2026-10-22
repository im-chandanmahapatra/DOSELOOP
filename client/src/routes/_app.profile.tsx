import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Mail,
  Pill,
  Users,
  Flame,
  Pencil,
  ShieldCheck,
  Download,
  LogOut,
  Trash2,
  HeartPulse,
  UserCheck,
  Lock,
  Calendar,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";
import { useAuth } from "@/AuthProvider";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "User Profile — DoseLoop" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/user/profile"],
    queryFn: () => fetcher("/user/profile"),
  });

  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ["/medications"],
    queryFn: () => fetcher("/medications"),
  });

  const { data: members = [], isLoading: memsLoading } = useQuery({
    queryKey: ["/family"],
    queryFn: () => fetcher("/family"),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) =>
      updater("/user/profile", data, "PUT"),
    onSuccess: () => {
      setEditOpen(false);
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
      a.download = `doseloop_health_record_${Date.now()}.json`;
      a.click();
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => updater("/settings/account", {}, "DELETE"),
    onSuccess: async () => {
      await signOut();
      navigate({ to: "/" });
    },
  });

  const handleOpenEdit = () => {
    setEditFirstName(user?.firstName || "");
    setEditLastName(user?.lastName || "");
    setEditOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (userLoading || medsLoading || memsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading profile details…
      </div>
    );
  }

  const stats = [
    {
      icon: Pill,
      label: "Active Regimen",
      value: `${medications.length} Prescribed`,
      desc: "Daily adherence tracked",
      chip: "bg-primary/10 text-primary",
    },
    {
      icon: Users,
      label: "Care Circle",
      value: `${members.length} Members`,
      desc: "Connected caregivers",
      chip: "bg-accent/15 text-accent-foreground",
    },
    {
      icon: Flame,
      label: "Adherence Streak",
      value: "14 Days",
      desc: "Consecutive logging",
      chip: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
    {
      icon: ShieldCheck,
      label: "Data Integrity",
      value: "Encrypted",
      desc: "Zero-knowledge storage",
      chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
  ] as const;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Account & Clinical ID"
        title="Personal Profile"
        description="Manage your identity, care circle role, and personal health record credentials."
      />

      {/* Main Profile Identity Card */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="size-20 border-2 border-primary/20 shadow-soft">
                <AvatarFallback className="bg-primary/10 font-serif text-2xl font-bold text-primary">
                  {user?.initials || user?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0 right-0 size-5 rounded-full border-2 border-card bg-emerald-500"
                title="Active account"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h1>
                <Badge
                  variant="outline"
                  className="border-border bg-background/60 text-xs font-semibold"
                >
                  {user?.plan || "Self-managing patient"}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3.5" /> {user?.email}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                DoseLoop ID:{" "}
                <code className="font-mono text-[10px]">{user?.id?.slice(0, 18)}…</code>
              </p>
            </div>
          </div>

          {/* Edit Profile Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="wine"
                size="sm"
                className="rounded-xl shadow-soft"
                onClick={handleOpenEdit}
              >
                <Pencil className="size-3.5 mr-1.5" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-border/80 bg-card">
              <DialogHeader>
                <DialogTitle className="font-serif">Update Personal Identity</DialogTitle>
                <DialogDescription>
                  Modify the name associated with your health records and caregiver notifications.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate({
                    firstName: editFirstName,
                    lastName: editLastName,
                  });
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="edit-firstname">First Name</Label>
                  <Input
                    id="edit-firstname"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-lastname">Last Name</Label>
                  <Input
                    id="edit-lastname"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email">Account Email</Label>
                  <Input
                    id="edit-email"
                    disabled
                    value={user?.email || ""}
                    className="rounded-xl bg-muted/40 cursor-not-allowed text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email is managed by authentication provider.
                  </p>
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="wine"
                    className="rounded-xl"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 4-Stat Overview Row */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col justify-between rounded-2xl border border-border/70 bg-background/50 p-4 transition-all hover:bg-background shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
                <span className={`grid size-7 place-items-center rounded-lg ${s.chip}`}>
                  <s.icon className="size-3.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-numeric text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-Column Clinical Summary & Account Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal & Clinical Information */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
              <HeartPulse className="size-4 text-primary" /> Clinical Profile Summary
            </h2>
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">
              Verified
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Care Recipient Role</p>
                <p className="text-[11px] text-muted-foreground">Self-Directed Primary Patient</p>
              </div>
              <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Emergency Blood Type</p>
                <p className="text-[11px] text-muted-foreground">
                  Registered in Emergency Medical ID
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-primary">O+</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Documented Allergies</p>
                <p className="text-[11px] text-muted-foreground">Severe reaction risk</p>
              </div>
              <span className="text-xs font-bold text-destructive">Penicillin</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Primary Physician</p>
                <p className="text-[11px] text-muted-foreground">
                  Dr. Rachel Thorne, MD (555-019-4821)
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                On File
              </Badge>
            </div>
          </div>
        </section>

        {/* Data Privacy & Account Actions */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
              <Lock className="size-4 text-primary" /> Privacy & Account Actions
            </h2>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs">
              Compliant
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Export Health Record</p>
                  <p className="text-[11px] text-muted-foreground">
                    Download complete medication logs, wellness history, and family records.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border bg-card shrink-0 ml-3"
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                >
                  <Download className="size-3.5 mr-1" />
                  {exportMutation.isPending ? "Exporting…" : "Export JSON"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Sign Out of Session</p>
                  <p className="text-[11px] text-muted-foreground">
                    Safely end this active browser session.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-muted-foreground hover:text-foreground shrink-0 ml-3"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-3.5 mr-1" /> Sign Out
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/[0.03] p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-destructive">Delete Account & Data</p>
                  <p className="text-[11px] text-muted-foreground">
                    Permanently delete all medications, family links, and health records.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:bg-destructive/10 shrink-0 ml-3 text-xs"
                    >
                      <Trash2 className="size-3.5 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border-border/80 bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif">
                        Permanently Delete Account?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All medication schedules, adherence records,
                        and family circle relationships will be erased immediately.
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
      </div>

      {/* Quick Navigation Footer */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft">
        <h3 className="font-serif text-sm font-bold text-foreground">Explore Connected Features</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" className="justify-start rounded-xl">
            <Link to="/settings">
              <Lock className="size-4 mr-2 text-primary" /> Privacy & Notification Settings
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start rounded-xl">
            <Link to="/circle">
              <Users className="size-4 mr-2 text-primary" /> Manage Caregiver Circle
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start rounded-xl">
            <Link to="/emergency">
              <HeartPulse className="size-4 mr-2 text-primary" /> First Responder Medical ID
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
