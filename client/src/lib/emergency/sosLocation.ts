/**
 * DoseLoop SOS Mode & Geolocation Utilities
 *
 * CRITICAL SAFETY & PRIVACY GUARANTEES:
 * 1. Coordinates are retrieved strictly in the user's browser via navigator.geolocation.
 * 2. Coordinates are NEVER transmitted to DoseLoop servers or any third-party backend.
 * 3. Coordinates are NEVER persisted in localStorage, sessionStorage, IndexedDB, cookies, or analytics logs.
 * 4. Location sharing is 100% explicit and user-directed via the native device share sheet or clipboard.
 * 5. Emergency access to 112 is NEVER blocked by geolocation failures, denials, or timeouts.
 */

export interface SosCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
}

export type SosErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED"
  | "INSECURE_CONTEXT"
  | "UNKNOWN";

export interface SosError {
  code: SosErrorCode;
  message: string;
  userAdvice: string;
}

export const GEOLOCATION_CONFIG: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12000, // 12 seconds to prevent hanging UI
  maximumAge: 0, // Force a fresh fix, never use stale cached position
};

/**
 * Format raw latitude/longitude into human-friendly coordinate notation
 * e.g., 12.9716° N, 77.5946° E
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Format accuracy in meters with a calm indicator
 */
export function formatAccuracy(accuracyMeters: number): string {
  if (accuracyMeters < 1) return "< 1m";
  return `±${Math.round(accuracyMeters)}m`;
}

/**
 * Format timestamp into readable localized time with date
 */
export function formatSosTimestamp(timestamp: number | Date): string {
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Generate a standard Google Maps URL from latitude and longitude.
 * Formats coordinates to 6 decimal places (~0.1m precision).
 */
export function generateGoogleMapsUrl(lat: number, lng: number): string {
  const formattedLat = lat.toFixed(6);
  const formattedLng = lng.toFixed(6);
  return `https://www.google.com/maps?q=${formattedLat},${formattedLng}`;
}

/**
 * Generate a standardized, concise emergency share message matching the specification:
 * "I'm requesting help. My current location: [map link]. Please contact me or send assistance."
 */
export function constructSosMessage(params: {
  mapsUrl: string;
  accuracy?: number;
  timestamp?: number | Date;
}): string {
  const parts: string[] = [];
  if (params.accuracy !== undefined) {
    parts.push(`approx. ${formatAccuracy(params.accuracy)} accuracy`);
  }
  if (params.timestamp) {
    parts.push(formatSosTimestamp(params.timestamp));
  }

  const meta = parts.length > 0 ? ` (${parts.join(", ")})` : "";
  return `I'm requesting help. My current location: ${params.mapsUrl}${meta}. Please contact me or send assistance.`;
}

/**
 * Generate WhatsApp share link (ubiquitous in India for family/caregiver emergency messaging)
 */
export function generateWhatsAppShareUrl(message: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * Map browser Geolocation errors to empathetic, actionable instructions
 */
export function mapGeolocationError(err: unknown): SosError {
  // Check for GeolocationPositionError constants
  if (typeof err === "object" && err !== null && "code" in err) {
    const geoErr = err as GeolocationPositionError;
    switch (geoErr.code) {
      case 1: // PERMISSION_DENIED
        return {
          code: "PERMISSION_DENIED",
          message: "Location permission was denied.",
          userAdvice:
            "Location access was blocked. Please enable location permissions for DoseLoop in your browser or device settings, or dial 112 directly.",
        };
      case 2: // POSITION_UNAVAILABLE
        return {
          code: "POSITION_UNAVAILABLE",
          message: "Location signals are currently unavailable.",
          userAdvice:
            "Your device could not get a GPS or cellular positioning signal. Check device location services or dial 112 directly.",
        };
      case 3: // TIMEOUT
        return {
          code: "TIMEOUT",
          message: "Location request timed out.",
          userAdvice:
            "A GPS lock could not be obtained within 12 seconds. Tap retry, or dial 112 immediately for emergency support.",
        };
    }
  }

  return {
    code: "UNKNOWN",
    message: err instanceof Error ? err.message : "Unable to determine current location.",
    userAdvice: "An unexpected error occurred while locating. Please dial 112 directly.",
  };
}

/**
 * Check browser environment compatibility for Geolocation & Security
 */
export function checkGeolocationSupport(): {
  supported: boolean;
  isSecure: boolean;
  error?: SosError;
} {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      supported: false,
      isSecure: false,
      error: {
        code: "UNSUPPORTED",
        message: "Browser environment not detected.",
        userAdvice: "Please use a modern web browser on your phone or computer.",
      },
    };
  }

  // Geolocation requires a Secure Context (HTTPS or localhost) per W3C specification
  const isSecure =
    window.isSecureContext ??
    (window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (!isSecure) {
    return {
      supported: false,
      isSecure: false,
      error: {
        code: "INSECURE_CONTEXT",
        message: "Geolocation requires a secure connection (HTTPS).",
        userAdvice:
          "Modern browsers restrict location access to secure HTTPS connections. Access DoseLoop via HTTPS, or dial 112 directly.",
      },
    };
  }

  if (!("geolocation" in navigator) || !navigator.geolocation) {
    return {
      supported: false,
      isSecure: true,
      error: {
        code: "UNSUPPORTED",
        message: "Geolocation API is not supported by your browser.",
        userAdvice:
          "Your current browser does not support GPS location lookup. Please dial 112 directly.",
      },
    };
  }

  return {
    supported: true,
    isSecure: true,
  };
}

/**
 * Retrieve current location with strict privacy safeguards:
 * - Returns coordinates in-memory only.
 * - Does not write to localStorage.
 * - Does not make network requests.
 */
export function getCurrentSosPosition(): Promise<SosCoordinates> {
  return new Promise((resolve, reject) => {
    const support = checkGeolocationSupport();
    if (!support.supported && support.error) {
      return reject(support.error);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp || Date.now(),
        });
      },
      (error) => {
        reject(mapGeolocationError(error));
      },
      GEOLOCATION_CONFIG,
    );
  });
}
