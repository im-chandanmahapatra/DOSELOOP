import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Pill,
  Clock,
  AlertCircle,
  Pencil,
  Package,
  Trash2,
  CheckCircle2,
  Droplet,
  Sparkles,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/_app/medications")({
  head: () => ({ meta: [{ title: "Medications — DoseLoop" }] }),
  component: Medications,
});

interface MedicationItem {
  id: string;
  color?: string;
  name: string;
  dosage: string;
  form: string;
  schedule: string;
  critical: boolean;
  refillIn?: number;
  notes?: string;
}

const colorPresets = [
  { name: "Burgundy Wine", value: "#7A2E38" },
  { name: "Antique Gold", value: "#B89450" },
  { name: "Forest Sage", value: "#2B7050" },
  { name: "Sky Cobalt", value: "#2A5A78" },
  { name: "Warm Amber", value: "#D97706" },
  { name: "Royal Plum", value: "#6B21A8" },
];

function Medications() {
  const [addOpen, setAddOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicationItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "refill" | "critical">("all");
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ["/medications"],
    queryFn: () => fetcher("/medications"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => updater(`/medications/${id}`, {}, "DELETE"),
    onSuccess: () => {
      trackEvent("medication_deleted");
      toast.success("Medication removed from regimen");
      queryClient.invalidateQueries({ queryKey: ["/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/summary"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-serif text-sm font-medium text-muted-foreground">Loading your medication regimen...</p>
        </div>
      </div>
    );
  }

  const filteredMeds = medications.filter((m: MedicationItem) => {
    if (activeFilter === "refill") return (m.refillIn ?? 99) <= 14;
    if (activeFilter === "critical") return m.critical;
    return true;
  });

  return (
    <div className="space-y-8 pb-12 animate-fade">
      <PageHeader
        eyebrow="Clinical Regimen"
        title="Medication Management"
        description="Configure dosage schedules, refill alerts, and caregiver check-in triggers with zero alarm fatigue."
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="wine" size="lg" className="rounded-2xl shadow-soft">
                <Plus className="size-4 mr-1.5" /> Add Medication
              </Button>
            </DialogTrigger>
            <AddMedicationDialog onClose={() => setAddOpen(false)} />
          </Dialog>
        }
      />

      {/* Regimen Filter Pill Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 p-1 text-xs font-medium shadow-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1 transition-all",
              activeFilter === "all"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All Prescriptions ({medications.length})
          </button>
          <button
            onClick={() => setActiveFilter("refill")}
            className={cn(
              "rounded-lg px-3 py-1 transition-all",
              activeFilter === "refill"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Refill Alert ({medications.filter((m: MedicationItem) => (m.refillIn ?? 99) <= 14).length})
          </button>
          <button
            onClick={() => setActiveFilter("critical")}
            className={cn(
              "rounded-lg px-3 py-1 transition-all",
              activeFilter === "critical"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Critical Only ({medications.filter((m: MedicationItem) => m.critical).length})
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredMeds.length} of {medications.length} prescriptions
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {filteredMeds.length === 0 && (
          <div className="col-span-full text-center p-14 border border-dashed border-border/90 rounded-3xl bg-card/60 text-muted-foreground space-y-3 shadow-soft">
            <Pill className="size-12 mx-auto text-primary/60" />
            <h3 className="font-serif text-lg font-bold text-foreground">No medications match filter</h3>
            <p className="text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Add your vitamins or daily prescriptions to begin receiving gentle reminders.
            </p>
            <Button variant="outline" className="rounded-xl mt-2" onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-1.5" /> Add your first medication
            </Button>
          </div>
        )}

        {filteredMeds.map((med: MedicationItem) => {
          const pillColor = med.color || "#7A2E38";
          const refillDays = med.refillIn ?? 14;
          const isLowStock = refillDays <= 7;

          return (
            <article
              key={med.id}
              className="card-interactive rounded-3xl border border-border/80 bg-card p-6 shadow-soft transition-all hover:shadow-lift flex flex-col justify-between"
            >
              <div>
                {/* Header with Color Dot & Action Buttons */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-12 place-items-center rounded-2xl shadow-xs text-white"
                      style={{ backgroundColor: pillColor }}
                    >
                      <Pill className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold tracking-tight text-foreground">
                        {med.name}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {med.dosage} · <span className="capitalize">{med.form}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${med.name}`}
                      onClick={() => setEditingMed(med)}
                      className="hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${med.name}`}
                      onClick={() => {
                        if (confirm(`Remove ${med.name} from your medication regimen?`)) {
                          deleteMutation.mutate(med.id);
                        }
                      }}
                      className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Schedule & Clinical Indicators */}
                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 border border-border/60">
                    <span className="flex items-center gap-2 text-foreground font-semibold text-xs">
                      <Clock className="size-3.5 text-primary" />
                      {med.schedule}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-card border-border/80">
                      Synchronized
                    </Badge>
                  </div>

                  {med.critical && (
                    <div className="flex items-center gap-2 font-bold text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 border border-destructive/20">
                      <ShieldAlert className="size-4 shrink-0" />
                      <span>Critical Regimen · Caregiver check-in enabled</span>
                    </div>
                  )}

                  {/* Refill Inventory Bar */}
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2.5 border transition-colors",
                      isLowStock
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                        : "bg-muted/40 border-border/60 text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Package className="size-3.5" />
                        Supply Inventory
                      </span>
                      <span>{refillDays} days remaining</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isLowStock ? "bg-amber-500" : "bg-primary",
                        )}
                        style={{ width: `${Math.min(100, Math.max(15, (refillDays / 30) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {med.notes && (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground">Instructions: </span>
                    {med.notes}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="size-3.5" />
                  Active in Loop
                </span>
                <button
                  type="button"
                  onClick={() => setEditingMed(med)}
                  className="text-primary font-bold hover:underline"
                >
                  Edit Schedule →
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Connected Edit Medication Dialog */}
      {editingMed && (
        <EditMedicationDialog
          medication={editingMed}
          onClose={() => setEditingMed(null)}
        />
      )}
    </div>
  );
}

function AddMedicationDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    form: "PILL",
    frequency: "Daily",
    firstTime: "08:00",
    critical: false,
    color: "#7A2E38",
    refillIn: 30,
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => updater("/medications", data, "POST"),
    onSuccess: () => {
      trackEvent("medication_created");
      toast.success("Medication added to regimen ✓");
      queryClient.invalidateQueries({ queryKey: ["/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/summary"] });
      onClose();
    },
  });

  return (
    <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 border-border bg-card shadow-float">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl font-bold">Add Prescription</DialogTitle>
        <DialogDescription className="text-xs sm:text-sm leading-relaxed">
          Enter medication details. You can fine-tune dosage schedules anytime.
        </DialogDescription>
      </DialogHeader>

      <form
        className="space-y-4 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(formData);
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="m-name">Medication Name</Label>
          <Input
            id="m-name"
            placeholder="e.g. Lisinopril, Metformin"
            required
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-dose">Dosage</Label>
            <Input
              id="m-dose"
              placeholder="e.g. 10 mg, 500 mg"
              required
              value={formData.dosage}
              onChange={(e) => setFormData((p) => ({ ...p, dosage: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-form">Form</Label>
            <Input
              id="m-form"
              placeholder="Tablet, Capsule, Liquid"
              value={formData.form}
              onChange={(e) => setFormData((p) => ({ ...p, form: e.target.value }))}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-freq">Frequency</Label>
            <Input
              id="m-freq"
              placeholder="Daily, Twice daily"
              value={formData.frequency}
              onChange={(e) => setFormData((p) => ({ ...p, frequency: e.target.value }))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-time">Scheduled Time</Label>
            <Input
              id="m-time"
              type="time"
              required
              value={formData.firstTime}
              onChange={(e) => setFormData((p) => ({ ...p, firstTime: e.target.value }))}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Color Palette Selector */}
        <div className="space-y-1.5">
          <Label>Color Identifier</Label>
          <div className="flex items-center gap-2 pt-1">
            {colorPresets.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, color: c.value }))}
                style={{ backgroundColor: c.value }}
                className={cn(
                  "size-7 rounded-full transition-transform active:scale-95",
                  formData.color === c.value
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                    : "opacity-80 hover:opacity-100",
                )}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="m-notes">Physician Instructions or Notes</Label>
          <Textarea
            id="m-notes"
            placeholder="e.g. Take with morning meal; avoid grapefruit"
            value={formData.notes}
            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            className="rounded-xl resize-none"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/30 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="m-crit" className="font-bold text-foreground">
              Critical Medication
            </Label>
            <p className="text-xs text-muted-foreground">
              Family Circle is gently alerted if this dose is missed past grace period.
            </p>
          </div>
          <Switch
            id="m-crit"
            checked={formData.critical}
            onCheckedChange={(c) => setFormData((p) => ({ ...p, critical: c }))}
          />
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button variant="wine" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Add Medication"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditMedicationDialog({
  medication,
  onClose,
}: {
  medication: MedicationItem;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: medication.name,
    dosage: medication.dosage,
    form: medication.form,
    schedule: medication.schedule,
    critical: medication.critical,
    notes: medication.notes || "",
    color: medication.color || "#7A2E38",
    refillIn: medication.refillIn || 14,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      updater(`/medications/${medication.id}`, data, "PUT"),
    onSuccess: () => {
      trackEvent("medication_updated");
      toast.success("Medication updated ✓");
      queryClient.invalidateQueries({ queryKey: ["/medications"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/summary"] });
      onClose();
    },
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 border-border bg-card shadow-float">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold">Edit {medication.name}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update dosage, schedules, or instructions for this prescription.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Medication Name</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-dose">Dosage</Label>
              <Input
                id="edit-dose"
                required
                value={formData.dosage}
                onChange={(e) => setFormData((p) => ({ ...p, dosage: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-schedule">Schedule</Label>
              <Input
                id="edit-schedule"
                value={formData.schedule}
                onChange={(e) => setFormData((p) => ({ ...p, schedule: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-form">Form</Label>
              <Input
                id="edit-form"
                value={formData.form}
                onChange={(e) => setFormData((p) => ({ ...p, form: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Instructions / Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-crit" className="font-bold text-foreground">
                Critical Medication
              </Label>
              <p className="text-xs text-muted-foreground">
                Family Circle is alerted if this dose is missed past grace period.
              </p>
            </div>
            <Switch
              id="edit-crit"
              checked={formData.critical}
              onCheckedChange={(c) => setFormData((p) => ({ ...p, critical: c }))}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button variant="wine" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
