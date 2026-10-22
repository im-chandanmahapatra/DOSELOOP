import { useState, useCallback, useRef } from "react";
import {
  SosCoordinates,
  SosError,
  getCurrentSosPosition,
  generateGoogleMapsUrl,
  constructSosMessage,
  mapGeolocationError,
} from "@/lib/emergency/sosLocation";

export type SosState = "idle" | "locating" | "ready" | "error";

export interface UseSosLocationReturn {
  status: SosState;
  coordinates: SosCoordinates | null;
  mapsUrl: string | null;
  shareMessage: string | null;
  error: SosError | null;
  isLocating: boolean;
  copied: boolean;
  canShareNative: boolean;
  requestLocation: () => Promise<SosCoordinates | null>;
  shareNative: () => Promise<boolean>;
  copyToClipboard: () => Promise<boolean>;
  reset: () => void;
}

export function useSosLocation(): UseSosLocationReturn {
  const [status, setStatus] = useState<SosState>("idle");
  const [coordinates, setCoordinates] = useState<SosCoordinates | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [error, setError] = useState<SosError | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Guard against concurrent invocations / rapid double taps
  const isLocatingRef = useRef<boolean>(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canShareNative = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const requestLocation = useCallback(async (): Promise<SosCoordinates | null> => {
    if (isLocatingRef.current) return null;
    isLocatingRef.current = true;

    setStatus("locating");
    setError(null);

    try {
      const coords = await getCurrentSosPosition();
      const url = generateGoogleMapsUrl(coords.latitude, coords.longitude);
      const msg = constructSosMessage({
        mapsUrl: url,
        accuracy: coords.accuracy,
        timestamp: coords.timestamp,
      });

      // Keep coordinates in local component state only (zero server / storage persistence)
      setCoordinates(coords);
      setMapsUrl(url);
      setShareMessage(msg);
      setStatus("ready");
      return coords;
    } catch (err: unknown) {
      const sosErr: SosError =
        typeof err === "object" && err !== null && "code" in err && "userAdvice" in err
          ? (err as SosError)
          : mapGeolocationError(err);

      setError(sosErr);
      setStatus("error");
      return null;
    } finally {
      isLocatingRef.current = false;
    }
  }, []);

  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!shareMessage) return false;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMessage);
      } else {
        // Fallback for older browsers or insecure frames
        const textArea = document.createElement("textarea");
        textArea.value = shareMessage;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 3500);

      return true;
    } catch (_err) {
      return false;
    }
  }, [shareMessage]);

  const shareNative = useCallback(async (): Promise<boolean> => {
    if (!shareMessage || !mapsUrl) return false;

    if (canShareNative) {
      try {
        await navigator.share({
          title: "SOS — My Current Location (DoseLoop Emergency)",
          text: shareMessage,
          url: mapsUrl,
        });
        return true;
      } catch (err: unknown) {
        // User cancelling the share sheet triggers AbortError; do not treat as a failure
        if (err instanceof Error && err.name === "AbortError") {
          return false;
        }
        // If native share failed for another reason, fallback to clipboard
      }
    }

    // Fallback to clipboard
    return copyToClipboard();
  }, [shareMessage, mapsUrl, canShareNative, copyToClipboard]);

  const reset = useCallback(() => {
    setStatus("idle");
    setCoordinates(null);
    setMapsUrl(null);
    setShareMessage(null);
    setError(null);
    setCopied(false);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  return {
    status,
    coordinates,
    mapsUrl,
    shareMessage,
    error,
    isLocating: status === "locating",
    copied,
    canShareNative,
    requestLocation,
    shareNative,
    copyToClipboard,
    reset,
  };
}
