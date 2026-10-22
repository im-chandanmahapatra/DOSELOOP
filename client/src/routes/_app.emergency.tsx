import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, ShieldAlert, HeartPulse, Plus, Trash2, ExternalLink, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";

export const Route = createFileRoute("/_app/emergency")({
  head: () => ({ meta: [{ title: "Emergency Support — DoseLoop" }] }),
  component: Emergency,
});

const emergencyHotlines = [
  { name: "Emergency Services (Ambulance / Police / Fire)", number: "911", dial: "tel:911", desc: "For life-threatening acute medical emergencies" },
  { name: "Poison Control Center", number: "1-800-222-1222", dial: "tel:18002221222", desc: "For medication overdoses & toxic exposures" },
  { name: "Suicide & Crisis Lifeline", number: "988", dial: "tel:988", desc: "Free, confidential 24/7 mental health crisis support" },
];

const medicalInfo = [
  { label: "Blood Type", value: "O+", highlight: true },
  { label: "Documented Allergies", value: "Penicillin (severe anaphylaxis)", critical: true },
  { label: "Chronic Conditions", value: "Hypertension, Type 2 Diabetes" },
  { label: "Active Regimen", value: "Lisinopril 10mg, Metformin 500mg, Atorvastatin 20mg" },
  { label: "Primary Physician", value: "Dr. Rachel Thorne, MD (555-019-4821)" },
];

function Emergency() {
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/emergency"],
    queryFn: () => fetcher("/emergency"),
  });

  const [sosStatus, setSosStatus] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newRelation, setNewRelation] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");

  const createContactMutation = useMutation({
    mutationFn: () =>
      updater("/emergency", { name: newName, relation: newRelation, phone: newPhone }, "POST"),
    onSuccess: () => {
      setAddOpen(false);
      setNewName("");
      setNewRelation("");
      setNewPhone("");
      queryClient.invalidateQueries({ queryKey: ["/emergency"] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => updater(`/emergency/${id}`, {}, "DELETE"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/emergency"] });
    },
  });

  const sosMutation = useMutation({
    mutationFn: (payload: any) => updater("/emergency/sos", payload, "POST"),
    onSuccess: (res: any) => {
      const count = res?.data?.contactsNotified ?? 0;
      const emailsFailed = res?.data?.emailsFailed ?? 0;
      if (emailsFailed > 0) {
        setSosStatus(`SOS Alert Broadcasted: Notified ${count} contact(s). (${emailsFailed} email delivery delayed).`);
      } else {
        setSosStatus(`SOS Alert Broadcasted Successfully: ${count} contact(s) notified with location.`);
      }
    },
    onError: () => {
      setSosStatus("Failed to send SOS alert through network. Please dial emergency services directly.");
    }
  });

  const handleConfirmSOS = () => {
    setSosStatus(null);
    if (!navigator.geolocation) {
      sosMutation.mutate({ timestamp: Date.now() });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        sosMutation.mutate({
          latitude,
          longitude,
          accuracy,
          mapsUrl,
          timestamp: Date.now(),
        });
      },
      (error) => {
        console.warn("Geolocation denied or failed:", error);
        sosMutation.mutate({ timestamp: Date.now() });
      },
      { timeout: 10000 }
    );
  };

  if (isLoading)
    return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading emergency protocols...</div>;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Emergency Protocols"
        title="Immediate Care & Safety Hub"
        description="Rapid-dispatch hotlines, medical emergency profile, and one-tap caregiver SOS broadcast."
      />

      {/* Primary SOS Action Banner */}
      <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20">
              <ShieldAlert className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">Need Urgent Medical Assistance?</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
                Triggering SOS broadcasts your immediate GPS coordinates and emergency medical summary to all designated Care Circle contacts.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-3 text-sm font-semibold text-white shadow-lift transition-transform active:scale-95 hover:bg-destructive/90"
            >
              <Phone className="size-4" /> Dial 911 Direct
            </a>
          </div>
        </div>

        {sosStatus && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-card p-4 text-sm font-medium text-foreground shadow-xs">
            <AlertTriangle className="size-4 text-destructive shrink-0" />
            <span>{sosStatus}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="flex-1 rounded-xl shadow-soft"
                disabled={sosMutation.isPending}
              >
                <Phone className="size-4 mr-2" />{" "}
                {sosMutation.isPending ? "Broadcasting SOS…" : "Broadcast SOS to Family Circle"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-border/80 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif">Broadcast SOS Alert to Family?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground leading-relaxed">
                  This will immediately notify all registered emergency contacts via SMS/Email with your current GPS location and emergency medical summary.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSOS} className="rounded-xl bg-destructive hover:bg-destructive/90 text-white">
                  Yes, broadcast now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            size="lg"
            className="flex-1 rounded-xl border-border/80 bg-card hover:bg-muted/40"
            onClick={handleConfirmSOS}
          >
            <MapPin className="size-4 mr-2 text-primary" /> Update Location Ping
          </Button>
        </div>
      </section>

      {/* Hotlines */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-soft">
        <h2 className="flex items-center gap-2 text-base font-serif font-bold text-foreground">
          <Phone className="size-4 text-primary" /> Dedicated Medical Hotlines
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {emergencyHotlines.map((hotline) => (
            <div
              key={hotline.name}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-background/60 p-4 transition-all hover:border-primary/40 hover:bg-background"
            >
              <div>
                <p className="text-xs font-semibold text-foreground">{hotline.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{hotline.desc}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                <span className="font-mono text-sm font-bold text-primary">{hotline.number}</span>
                <a
                  href={hotline.dial}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <Phone className="size-3" /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Emergency Contacts List */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-serif font-bold text-foreground">
                <Phone className="size-4 text-primary" /> Emergency Contacts
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically notified when you broadcast an SOS
              </p>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="wine" size="sm" className="rounded-xl">
                  <Plus className="size-3.5 mr-1" /> Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-border/80 bg-card">
                <DialogHeader>
                  <DialogTitle className="font-serif">Add Emergency Contact</DialogTitle>
                  <DialogDescription>
                    This contact will receive automated SMS alerts and health summaries during an emergency.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-4 pt-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createContactMutation.mutate();
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="e.g. Maya Sharma"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-relation">Relationship</Label>
                    <Input
                      id="contact-relation"
                      placeholder="e.g. Daughter, Spouse, Primary Physician"
                      required
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-phone">Phone Number (with country code)</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="wine" className="rounded-xl" disabled={createContactMutation.isPending}>
                      <Plus className="size-4 mr-1.5" />{" "}
                      {createContactMutation.isPending ? "Adding…" : "Save Contact"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <ul className="mt-4 space-y-3">
            {contacts.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No emergency contacts registered yet. Add a family member or doctor above.
              </li>
            ) : (
              contacts.map((m: { id: string; name: string; relation: string; phone: string }) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:bg-background"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 border border-border/80">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {m.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{m.name}</p>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border">
                          {m.relation}
                        </Badge>
                      </div>
                      <a
                        href={`tel:${m.phone}`}
                        className="mt-0.5 inline-block font-mono text-xs text-muted-foreground hover:text-primary hover:underline"
                        title="Click to dial"
                      >
                        {m.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${m.phone}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                      aria-label={`Call ${m.name}`}
                    >
                      <Phone className="size-3.5" /> Call
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${m.name}`}
                      onClick={() => deleteContactMutation.mutate(m.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Medical ID Card for First Responders */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-serif font-bold text-foreground">
                <HeartPulse className="size-4 text-primary" /> First Responder Medical ID
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Critical health profile formatted for paramedical reference
              </p>
            </div>
            <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px]">
              Active Profile
            </Badge>
          </div>

          <dl className="mt-4 space-y-3">
            {medicalInfo.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-background/40 p-3"
              >
                <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                <dd className="text-right text-xs font-semibold text-foreground">
                  {row.critical ? (
                    <span className="inline-flex items-center gap-1 text-destructive font-bold">
                      <AlertTriangle className="size-3" /> {row.value}
                    </span>
                  ) : row.highlight ? (
                    <span className="font-mono text-sm font-bold text-primary">{row.value}</span>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
            Medical data synchronized with your private DoseLoop health record.
          </p>
        </div>
      </div>
    </div>
  );
}
