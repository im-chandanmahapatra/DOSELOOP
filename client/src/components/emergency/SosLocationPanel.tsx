import * as React from "react";
import {
  Phone,
  MapPin,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useSosLocation } from "@/hooks/useSosLocation";
import {
  formatCoordinates,
  formatAccuracy,
  formatSosTimestamp,
  generateWhatsAppShareUrl,
} from "@/lib/emergency/sosLocation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SosLocationPanel() {
  const {
    status,
    coordinates,
    mapsUrl,
    shareMessage,
    error,
    isLocating,
    copied,
    canShareNative,
    requestLocation,
    shareNative,
    copyToClipboard,
    reset,
  } = useSosLocation();

  const [manualSelectOpen, setManualSelectOpen] = React.useState(false);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleShareOnWhatsApp = () => {
    if (!shareMessage) return;
    const waUrl = generateWhatsAppShareUrl(shareMessage);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleManualCopy = () => {
    setManualSelectOpen(true);
    setTimeout(() => {
      textAreaRef.current?.select();
    }, 50);
  };

  return (
    <section
      aria-labelledby="sos-panel-heading"
      className="rounded-3xl border-2 border-destructive/40 bg-card p-5 sm:p-7 shadow-lift transition-all"
    >
      {/* Top Banner: Emergency Calling Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex items-start gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-destructive text-white shadow-soft">
            <Phone className="size-6 animate-pulse" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="sos-panel-heading" className="text-xl font-serif font-bold text-foreground">
                Urgent Assistance Hub
              </h2>
              <Badge className="bg-destructive/15 text-destructive border-destructive/25 text-xs font-semibold">
                India ERSS
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed max-w-lg">
              For immediate life threats, dial <strong className="text-foreground">112</strong>.
              Share your live GPS location with trusted caregivers or first responders below.
            </p>
          </div>
        </div>

        {/* Primary Call 112 Direct Button */}
        <div className="flex items-center gap-2">
          <a
            href="tel:112"
            id="emergency-call-112-btn"
            aria-label="Call National Emergency 112 directly"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-destructive px-6 py-3.5 text-base font-bold text-white shadow-lift transition-all hover:bg-destructive/90 hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
          >
            <Phone className="size-5" aria-hidden="true" />
            <span>Call 112 (Universal)</span>
          </a>
        </div>
      </div>

      {/* SOS Mode & Location Sharing Body */}
      <div className="mt-5 space-y-4">
        {/* Pre-Location Explanation (Visible when idle) */}
        {status === "idle" && (
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">SOS — Share My Location</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tapping below requests your browser&apos;s GPS location. Coordinates are processed{" "}
                  <strong>strictly on your device</strong> and are never transmitted to DoseLoop
                  servers or stored anywhere. You choose who receives the map link.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <Button
                type="button"
                id="sos-locate-btn"
                variant="default"
                size="lg"
                onClick={() => requestLocation()}
                disabled={isLocating}
                className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-soft"
              >
                <MapPin className="size-4 mr-1.5" aria-hidden="true" />
                Find &amp; Share My Location
              </Button>
            </div>
          </div>
        )}

        {/* Locating Spinner State */}
        {status === "locating" && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="size-6 text-primary animate-spin shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-foreground">
                  Acquiring Current GPS Coordinates…
                </p>
                <p className="text-xs text-muted-foreground">
                  Communicating with your device location hardware. Please accept the browser prompt
                  if requested.
                </p>
              </div>
            </div>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive hover:underline"
            >
              <Phone className="size-3.5" /> Or Call 112 Immediately
            </a>
          </div>
        )}

        {/* Error Feedback State */}
        {status === "error" && error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="size-5 text-destructive shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-foreground">{error.message}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {error.userAdvice}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => requestLocation()}
                className="rounded-xl border-border bg-card"
              >
                <RefreshCw className="size-3.5 mr-1.5" aria-hidden="true" /> Retry Location Request
              </Button>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-destructive/90"
              >
                <Phone className="size-3.5" aria-hidden="true" /> Call 112 Now
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                className="rounded-xl text-xs text-muted-foreground"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Ready / Location Retrieved State */}
        {status === "ready" && coordinates && mapsUrl && shareMessage && (
          <div
            role="region"
            aria-label="Detected Location & Sharing Options"
            className="rounded-2xl border border-success/30 bg-success/5 p-5 space-y-4 shadow-soft animate-rise"
          >
            {/* Coordinates & Accuracy Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-success/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-success/20 text-success">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">Location Pin Fixed</p>
                    <Badge
                      variant="outline"
                      className="border-success/40 text-success text-[10px] font-mono"
                    >
                      {formatAccuracy(coordinates.accuracy)}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {formatCoordinates(coordinates.latitude, coordinates.longitude)} •{" "}
                    {formatSosTimestamp(coordinates.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" /> View Map
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Update location pin"
                  onClick={() => requestLocation()}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Formatted Message Preview */}
            <div className="rounded-xl border border-border/80 bg-background/80 p-3.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Emergency Broadcast Text:
              </p>
              <p className="text-xs font-medium text-foreground leading-relaxed select-all">
                {shareMessage}
              </p>
            </div>

            {/* Sharing Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {canShareNative && (
                <Button
                  type="button"
                  id="sos-native-share-btn"
                  variant="default"
                  size="default"
                  onClick={() => shareNative()}
                  className="flex-1 min-w-[140px] rounded-xl bg-primary text-primary-foreground font-semibold shadow-soft"
                >
                  <Share2 className="size-4 mr-1.5" aria-hidden="true" />
                  Share via Sheet / SMS
                </Button>
              )}

              <Button
                type="button"
                id="sos-whatsapp-btn"
                variant="secondary"
                size="default"
                onClick={handleShareOnWhatsApp}
                className="flex-1 min-w-[140px] rounded-xl bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/25 font-semibold"
              >
                <MessageCircle className="size-4 mr-1.5 text-emerald-600" aria-hidden="true" />
                Share on WhatsApp
              </Button>

              <Button
                type="button"
                id="sos-copy-btn"
                variant="outline"
                size="default"
                onClick={() => copyToClipboard()}
                className="flex-1 min-w-[140px] rounded-xl border-border bg-card font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="size-4 mr-1.5 text-success" aria-hidden="true" />
                    <span className="text-success font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-1.5" aria-hidden="true" />
                    Copy Text &amp; Link
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualCopy}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Manual Text Box
              </Button>
            </div>

            {/* Manual fallback text area */}
            {manualSelectOpen && (
              <div className="pt-2 animate-rise">
                <label
                  htmlFor="manual-sos-text"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  If automatic copying or sharing is restricted, select and copy manually:
                </label>
                <textarea
                  id="manual-sos-text"
                  ref={textAreaRef}
                  readOnly
                  rows={3}
                  value={shareMessage}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Immediate Call option inside ready state */}
            <div className="flex items-center justify-between pt-2 border-t border-success/20 text-xs">
              <span className="text-muted-foreground">
                Accuracy depends on available GPS/cellular signals.
              </span>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1 font-bold text-destructive hover:underline"
              >
                <Phone className="size-3.5" /> Call 112 Now
              </a>
            </div>
          </div>
        )}

        {/* Privacy & Safety Footnote */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>
            <strong>Client-Side Only:</strong> Your coordinates are processed exclusively in your
            browser and never sent to or stored on DoseLoop servers.
          </span>
        </div>
      </div>
    </section>
  );
}
