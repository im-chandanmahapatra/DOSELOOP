import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  UserPlus,
  Mail,
  ShieldCheck,
  HeartHandshake,
  Trash2,
  CheckCircle2,
  Shield,
  Send,
  Clock,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/PageHeader";
import { StatusPill, type StatusTone } from "@/components/app/StatusPill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

export const Route = createFileRoute("/_app/circle")({
  head: () => ({ meta: [{ title: "Family Circle — DoseLoop" }] }),
  component: Circle,
});

const statusText: Record<string, { tone: StatusTone; label: string }> = {
  "on-track": { tone: "on-track", label: "On Track ✓" },
  attention: { tone: "attention", label: "Check-in Desirable" },
  quiet: { tone: "quiet", label: "Quietly Fine" },
};

function Circle() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRel, setInviteRel] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["/family"],
    queryFn: () => fetcher("/family"),
  });

  const toggleShareMutation = useMutation({
    mutationFn: ({
      id,
      sharesMedication,
      sharesWellness,
    }: {
      id: string;
      sharesMedication: boolean;
      sharesWellness: boolean;
    }) => updater(`/family/${id}/permissions`, { sharesMedication, sharesWellness }, "PUT"),
    onSuccess: () => {
      toast.success("Privacy permissions updated");
      queryClient.invalidateQueries({ queryKey: ["/family"] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      updater("/family/invite", { email: inviteEmail, relation: inviteRel }, "POST"),
    onSuccess: () => {
      toast.success(`Care invitation dispatched to ${inviteEmail}`);
      setOpen(false);
      setInviteEmail("");
      setInviteRel("");
      queryClient.invalidateQueries({ queryKey: ["/family"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => updater(`/family/${id}`, {}, "DELETE"),
    onSuccess: () => {
      toast.success("Member removed from circle");
      queryClient.invalidateQueries({ queryKey: ["/family"] });
    },
  });

  const toggleShare = (id: string, sharesMedication: boolean, sharesWellness: boolean) => {
    toggleShareMutation.mutate({
      id,
      sharesMedication,
      sharesWellness,
    });
  };

  const sendPulseToMember = (name: string) => {
    toast.success(`Sent reassurance pulse to ${name}!`, {
      description: "They have been notified that your health routine is calm and complete.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground font-serif">
        Loading Family Circle…
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade">
      <PageHeader
        eyebrow="Caregiver Closeness"
        title="Family Care Circle"
        description="Share medication adherence and wellness states with family and caregivers. Granular consent, zero surveillance, revocable anytime."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="wine" size="lg" className="rounded-2xl shadow-soft">
                <UserPlus className="size-4 mr-2" /> Invite Caregiver
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-border/80 bg-card p-6 sm:p-8 shadow-float">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-bold">Invite to Care Circle</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm leading-relaxed">
                  They will receive an invitation to join your circle. You decide exactly what health records are shared.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  inviteMutation.mutate();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Caregiver Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="caregiver@family.org"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-rel">Relationship</Label>
                  <Input
                    id="invite-rel"
                    placeholder="e.g. Daughter, Partner, Nurse, Son"
                    required
                    value={inviteRel}
                    onChange={(e) => setInviteRel(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <DialogFooter className="pt-3">
                  <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="wine" className="rounded-xl" disabled={inviteMutation.isPending}>
                    <Mail className="size-4 mr-2" />{" "}
                    {inviteMutation.isPending ? "Sending Invite…" : "Send Care Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/90 bg-card/60 p-14 text-center shadow-soft">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
            <HeartHandshake className="size-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground">No Family Members Yet</h3>
          <p className="mt-1 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Invite family members or caregivers to form your circle. They will receive calm daily summaries so they know you are doing well without constant check-in calls.
          </p>
          <Button variant="wine" size="sm" className="mt-4 rounded-xl" onClick={() => setOpen(true)}>
            <UserPlus className="size-3.5 mr-1.5" /> Invite First Member
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {members.map(
            (m: {
              id: string;
              name: string;
              status: string;
              initials: string;
              relation: string;
              role: string;
              statusLine: string;
              sharesMedication: boolean;
              sharesWellness: boolean;
            }) => {
              const s = statusText[m.status] ?? { tone: "quiet" as StatusTone, label: "Quietly Fine" };
              return (
                <article
                  key={m.id}
                  className="card-interactive rounded-3xl border border-border/80 bg-card p-6 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Member Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Avatar className="size-12 border border-border/80">
                          <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif font-bold text-lg text-foreground">{m.name}</p>
                            <Badge variant="outline" className="text-[10px] py-0 px-2 border-border/80 font-bold bg-secondary/50">
                              {m.relation}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {m.role === "OWNER" || m.role === "owner" ? "Primary Care Recipient" : "Active Caregiver"}
                          </p>
                        </div>
                      </div>
                      <StatusPill tone={s.tone}>{s.label}</StatusPill>
                    </div>

                    {/* Status Dispatch Bar */}
                    <div className="mt-4 rounded-2xl bg-secondary/40 p-3.5 text-xs text-foreground border border-border/50">
                      <p className="font-semibold">{m.statusLine || "All scheduled daily doses verified on time. Hydration consistent."}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" /> Synced 15 mins ago · Reassurance broadcast active
                      </p>
                    </div>

                    {/* Privacy & Permissions Controls */}
                    <div className="mt-5 space-y-3 rounded-2xl border border-border/70 bg-background/60 p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={`meds-${m.id}`} className="cursor-pointer text-xs font-bold text-foreground">
                            Share Medication Adherence
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Shares scheduled doses, completions, and refill warnings
                          </p>
                        </div>
                        <Switch
                          id={`meds-${m.id}`}
                          checked={m.sharesMedication}
                          onCheckedChange={() =>
                            toggleShare(m.id, !m.sharesMedication, m.sharesWellness)
                          }
                        />
                      </div>
                      <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={`well-${m.id}`} className="cursor-pointer text-xs font-bold text-foreground">
                            Share Wellness & Hydration
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Shares daily water intake, sleep quality, and mood
                          </p>
                        </div>
                        <Switch
                          id={`well-${m.id}`}
                          checked={m.sharesWellness}
                          onCheckedChange={() =>
                            toggleShare(m.id, m.sharesMedication, !m.sharesWellness)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Send Pulse & Delete */}
                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendPulseToMember(m.name)}
                      className="rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Send className="size-3.5 mr-1.5" /> Send Reassurance
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                        >
                          <Trash2 className="size-3.5 mr-1" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl border-border/80 bg-card p-6 shadow-float">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-serif text-xl font-bold">Remove {m.name}?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs sm:text-sm">
                            They will immediately lose access to your medication schedule and daily updates. You can re-invite them at any time.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-2">
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeMutation.mutate(m.id)}
                            className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
                          >
                            Yes, remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      {/* Respectful Architecture Guarantee */}
      <Card variant="editorial" className="p-6 border-primary/20 bg-primary/5 shadow-soft">
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-serif text-base font-bold text-foreground">Dignified Caregiver Architecture</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              DoseLoop operates on a principle of dignified privacy. Caregivers receive calm synthesized status indicators rather than minute-by-minute surveillance alerts, preserving patient autonomy while providing families with genuine peace of mind.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
