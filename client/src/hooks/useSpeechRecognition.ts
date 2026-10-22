/**
 * useSpeechRecognition.ts
 * React hook for browser-native Speech-to-Text (STT).
 *
 * Implements:
 * - Feature detection for SpeechRecognition and webkitSpeechRecognition
 * - Single-turn listening with interim feedback
 * - Error mapping and graceful recovery
 * - Guard against repeated taps and concurrent sessions
 * - Lifecycle cleanup on route change / component unmount
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  ISpeechRecognitionInstance,
  SpeechRecognitionConstructor,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  UseSpeechRecognitionOptions,
  UseSpeechRecognitionReturn,
} from "@/lib/speech/speechTypes";

/**
 * Resolves the browser's speech recognition constructor if available.
 */
function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = "en-IN", onFinalResult, onInterimResult, onError } = options;

  const [isSupported] = useState<boolean>(() => getSpeechRecognitionConstructor() !== null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  // Keep latest callbacks in refs to prevent unnecessary re-instantiations
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  const onInterimResultRef = useRef(onInterimResult);
  onInterimResultRef.current = onInterimResult;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Cleanup active recognition session
  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore errors during abort
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
    isStoppingRef.current = false;
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    isStoppingRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch {
      cleanup();
    }
  }, [isListening, cleanup]);

  const abortListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const startListening = useCallback(() => {
    const SpeechConstructor = getSpeechRecognitionConstructor();
    if (!SpeechConstructor) {
      const err = "Speech recognition is not supported in this browser.";
      setError(err);
      onErrorRef.current?.(err, "service-not-allowed");
      return;
    }

    // Guard: Prevent concurrent sessions from repeated taps
    if (isListening || recognitionRef.current) {
      return;
    }

    setError(null);
    setInterimTranscript("");
    isStoppingRef.current = false;

    try {
      const recognition = new SpeechConstructor();
      recognitionRef.current = recognition;

      recognition.continuous = false; // Single-turn for stability across Safari & mobile
      recognition.interimResults = true; // Stream interim hypotheses
      recognition.maxAlternatives = 1;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalPiece = "";
        let interimPiece = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalPiece += res[0].transcript;
          } else {
            interimPiece += res[0].transcript;
          }
        }

        if (interimPiece) {
          setInterimTranscript(interimPiece);
          onInterimResultRef.current?.(interimPiece);
        }

        if (finalPiece) {
          const trimmed = finalPiece.trim();
          setTranscript((prev) => (prev ? `${prev} ${trimmed}` : trimmed));
          setInterimTranscript("");
          onFinalResultRef.current?.(trimmed);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errCode = event.error;

        // Aborted is normal when user cancels or stops
        if (errCode === "aborted" || isStoppingRef.current) {
          return;
        }

        let userMessage = "Speech recognition error occurred.";
        switch (errCode) {
          case "not-allowed":
            userMessage = "Microphone access was denied. Please allow microphone access in your browser settings.";
            break;
          case "service-not-allowed":
            userMessage = "Speech service is unavailable or disabled on this device.";
            break;
          case "no-speech":
            userMessage = "No speech detected. Tap the microphone to try again.";
            break;
          case "network":
            userMessage = "Speech recognition requires an active network connection.";
            break;
          case "audio-capture":
            userMessage = "No microphone was found or audio capture is in use by another app.";
            break;
          default:
            userMessage = `Speech recognition error: ${errCode}`;
            break;
        }

        setError(userMessage);
        onErrorRef.current?.(userMessage, errCode);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
        setInterimTranscript("");
        isStoppingRef.current = false;
      };

      recognition.start();
    } catch (e: unknown) {
      cleanup();
      const message = e instanceof Error ? e.message : "Failed to start speech recognition";
      setError(message);
      onErrorRef.current?.(message, "service-not-allowed");
    }
  }, [lang, isListening, cleanup]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Cleanup on unmount or route change
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  };
}
