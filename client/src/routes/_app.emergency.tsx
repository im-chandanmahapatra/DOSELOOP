import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone,
  HeartPulse,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetcher, updater } from "@/lib/api";
import { SosLocationPanel } from "@/components/emergency/SosLocationPanel";
import { IndianEmergencyServicesGrid } from "@/components/emergency/IndianEmergencyServicesGrid";

export const Route = createFileRoute("/_app/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Support & Indian Helplines — DoseLoop" },
      {
        name: "description",
        content:
          "Verified Indian emergency numbers (112, 108, 102, 101, 100), client-side SOS GPS location sharing, and Care Circle emergency contacts.",
      },
    ],
  }),
  component: EmergencyPage,
});

const defaultMedicalInfo = [
  { label: "Blood Group", value: "B+ Positive", highlight: true },
  { label: "Documented Allergies", value: "Penicillin (severe anaphylaxis)", critical: true },
  { label: "Chronic Conditions", value: "Type 2 Diabetes, Hypertension" },
  { label: "Active Medication", value: "Metformin 500mg BD, Telmisartan 40mg OD" },
  {
    label: "Primary Physician",
    value: "Dr. Rajesh Gupta, MD (Apollo Hospitals) — +91 98201 54321",
  },
];

interface ContactItem {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

function EmergencyPage() {
  const queryClient = useQueryClient();

  const { data: contactsResponse, isLoading } = useQuery({
    queryKey: ["/emergency"],
    queryFn: () => fetcher("/emergency"),
  });

  const contacts: ContactItem[] = Array.isArray(contactsResponse)
    ? contactsResponse
    : Array.isArray((contactsResponse as { data?: ContactItem[] })?.data)
      ? (contactsResponse as { data: ContactItem[] }).data
      : [];

  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newRelation, setNewRelation] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("+91 ");

  const createContactMutation = useMutation({
    mutationFn: () =>
      updater(
        "/emergency",
        { name: newName, relation: newRelation, phone: newPhone.trim() },
        "POST",
      ),
    onSuccess: () => {
      setAddOpen(false);
      setNewName("");
      setNewRelation("");
      setNewPhone("+91 ");
      queryClient.invalidateQueries({ queryKey: ["/emergency"] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => updater(`/emergency/${id}`, {}, "DELETE"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/emergency"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        Loading emergency protocols &amp; contacts…
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-14">
      {/* Page Header */}
      <PageHeader
        eyebrow="Emergency & Safety Hub 🇮🇳"
        title="Immediate Care, SOS & Emergency Helplines"
        description="Verified Indian emergency dispatch numbers, private on-device SOS location sharing, and your designated Care Circle contacts."
      />

      {/* 1. Primary SOS & Real-time Location Sharing Panel */}
      <SosLocationPanel />

      {/* 2. Official Indian Emergency Services (112, 108, 102, 101, 100 & Specialized) */}
      <IndianEmergencyServicesGrid />

      {/* 3. Personal Care Circle & First Responder Medical ID */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Emergency Contacts */}
        <section
          aria-labelledby="care-contacts-heading"
          className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2
                  id="care-contacts-heading"
                  className="flex items-center gap-2 text-base font-serif font-bold text-foreground"
                >
                  <UserCheck className="size-4 text-primary" /> Personal Emergency Contacts
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Trusted family members or doctors to contact during health crises
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
                      Save a trusted family member, neighbor, or primary doctor for rapid-call
                      access.
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
                        placeholder="e.g. Priya Sharma"
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
                        placeholder="e.g. Daughter, Spouse, Cardiologist"
                        required
                        value={newRelation}
                        onChange={(e) => setNewRelation(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-phone">Phone Number (Indian format)</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="rounded-xl font-mono"
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => setAddOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="wine"
                        className="rounded-xl"
                        disabled={createContactMutation.isPending}
                      >
                        <Plus className="size-4 mr-1.5" />
                        {createContactMutation.isPending ? "Saving…" : "Save Contact"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Contacts list */}
            <ul className="mt-4 space-y-3">
              {contacts.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  No personal emergency contacts added yet. Add a family member or physician above.
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
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 border-border"
                          >
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
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                        aria-label={`Call ${m.name} at ${m.phone}`}
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

          <p className="mt-4 text-[11px] text-muted-foreground border-t border-border/40 pt-3">
            Tip: Keep at least two local contacts with active Indian mobile numbers for rapid
            reaching.
          </p>
        </section>

        {/* First Responder Medical ID Card */}
        <section
          aria-labelledby="medical-id-heading"
          className="rounded-3xl border border-border/80 bg-card p-6 shadow-soft flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2
                  id="medical-id-heading"
                  className="flex items-center gap-2 text-base font-serif font-bold text-foreground"
                >
                  <HeartPulse className="size-4 text-primary" /> Paramedical Emergency ID
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Critical medical summary for EMTs and attending doctors
                </p>
              </div>
              <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px]">
                Active Profile
              </Badge>
            </div>

            <dl className="mt-4 space-y-3">
              {defaultMedicalInfo.map((row) => (
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
          </div>

          <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-3">
            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
            Medical data synchronized with your private DoseLoop health passport.
          </p>
        </section>
      </div>
    </div>
  );
}
