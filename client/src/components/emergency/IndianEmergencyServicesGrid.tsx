import * as React from "react";
import {
  Phone,
  Shield,
  Flame,
  Truck,
  Baby,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  INDIAN_EMERGENCY_SERVICES,
  SPECIALIZED_INDIAN_HELPLINES,
  EmergencyContactInfo,
} from "@/lib/emergency/emergencyContacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getServiceIcon(id: string) {
  switch (id) {
    case "erss-112":
      return Shield;
    case "ambulance-108":
      return Truck;
    case "ambulance-102":
      return Baby;
    case "fire-101":
      return Flame;
    case "police-100":
      return Shield;
    default:
      return Phone;
  }
}

export function IndianEmergencyServicesGrid() {
  const [showSpecialized, setShowSpecialized] = React.useState(false);

  return (
    <section aria-labelledby="india-services-heading" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 pb-3">
        <div>
          <h2
            id="india-services-heading"
            className="text-lg font-serif font-bold text-foreground flex items-center gap-2"
          >
            <span className="text-xl">🇮🇳</span> Verified Indian Emergency Helplines
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official Government of India emergency response numbers with verified service scope.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-lg">
          <Info className="size-3.5 text-primary" aria-hidden="true" />
          <span>Toll-free 24/7 access from all operators</span>
        </div>
      </div>

      {/* Grid of Core Emergency Services */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INDIAN_EMERGENCY_SERVICES.map((service: EmergencyContactInfo) => {
          const Icon = getServiceIcon(service.id);
          const isPrimary = service.primary;

          return (
            <article
              key={service.id}
              className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                isPrimary
                  ? "border-destructive/50 bg-destructive/[0.03] ring-1 ring-destructive/20"
                  : "border-border/80 bg-card hover:border-primary/40 hover:bg-background/80"
              }`}
            >
              <div>
                {/* Header: Icon, Name, and Scope Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid size-9 place-items-center rounded-xl border ${
                        isPrimary
                          ? "bg-destructive/15 text-destructive border-destructive/25"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        {service.authority}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scope & Availability Badges */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {service.scope === "nationwide" ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] gap-1 py-0"
                    >
                      <CheckCircle2 className="size-2.5" /> Pan-India 24/7
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10px] gap-1 py-0"
                    >
                      <AlertCircle className="size-2.5" /> State-Dependent
                    </Badge>
                  )}

                  {isPrimary && (
                    <Badge className="bg-destructive text-white text-[10px] py-0">
                      Primary Single Emergency
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                  {service.description}
                </p>

                {/* State-dependent Qualification Note */}
                <div className="mt-2 rounded-xl bg-secondary/40 p-2.5 text-[11px] text-muted-foreground leading-normal border border-border/40">
                  <span className="font-semibold text-foreground">Service Note: </span>
                  {service.availabilityNote}
                </div>
              </div>

              {/* Call Action with Explicit Destination Number */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Dial Destination
                  </span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {service.number}
                  </span>
                </div>

                <a
                  href={service.dial}
                  id={`call-service-${service.id}`}
                  aria-label={`Call ${service.name} directly at ${service.number}`}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-soft transition-transform active:scale-95 ${
                    isPrimary
                      ? "bg-destructive text-white hover:bg-destructive/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/95"
                  }`}
                >
                  <Phone className="size-3.5" aria-hidden="true" />
                  <span>Call {service.number}</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Toggle Button for Specialized Helplines */}
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSpecialized(!showSpecialized)}
          className="w-full sm:w-auto rounded-xl border-border bg-card text-xs font-semibold gap-2"
        >
          <span>
            {showSpecialized ? "Hide" : "Show"} Specialized Indian Helplines (Mental Health, Women,
            Children, Cyber)
          </span>
          {showSpecialized ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {/* Collapsible Specialized Helplines */}
      {showSpecialized && (
        <div className="grid gap-3 sm:grid-cols-2 pt-1 animate-rise">
          {SPECIALIZED_INDIAN_HELPLINES.map((service: EmergencyContactInfo) => (
            <div
              key={service.id}
              className="rounded-2xl border border-border/70 bg-card p-4 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-foreground">{service.name}</h3>
                  <Badge variant="outline" className="text-[10px] font-mono py-0">
                    {service.number}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[10px] text-primary font-medium">{service.authority}</p>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  <span className="font-semibold text-foreground/80">Best for: </span>
                  {service.recommendedFor}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                <a
                  href={service.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                >
                  Official Portal <ExternalLink className="size-2.5" />
                </a>

                <a
                  href={service.dial}
                  aria-label={`Call ${service.name} at ${service.number}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Phone className="size-3" /> Call {service.number.split("/")[0].trim()}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
