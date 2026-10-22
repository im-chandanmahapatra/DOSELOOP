/**
 * useSpeechSynthesis.ts
 * React hook for browser-native Text-to-Speech (TTS).
 *
 * Implements:
 * - Feature detection for window.speechSynthesis and SpeechSynthesisUtterance
 * - Asynchronous voice discovery with voiceschanged handling
 * - Prioritized Indian English (en-IN) voice selection with universal fallbacks
 * - Non-destructive markdown sanitization and medical abbreviation expansion
 * - Sentence-level chunking to eliminate Chromium's 15-second freeze bug
 * - Reference retention to prevent premature JavaScript garbage collection
 * - Single-message concurrency control (stopping previous playback)
 * - Automatic cancellation on unmount and route changes
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type {
  UseSpeechSynthesisOptions,
  UseSpeechSynthesisReturn,
} from "@/lib/speech/speechTypes";
import { sanitizeForSpeech, chunkTextForSpeech } from "@/lib/speech/markdownSanitizer";

function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

/**
 * Finds the best matching voice for a given language tag.
 */
function resolveBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const target = targetLang.toLowerCase();
  const primaryLang = target.split("-")[0]; // e.g. "en"

  // 1. Exact language match (e.g. "en-IN")
  const exactMatch = voices.find((v) => v.lang.toLowerCase() === target);
  if (exactMatch) return exactMatch;

  // 2. Name or lang containing specific Indian English identifiers
  if (target === "en-in") {
    const indianVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("en-in") ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("prabhat") ||
        v.name.toLowerCase().includes("rishi")
    );
    if (indianVoice) return indianVoice;
  }

  // 3. Any voice matching primary language (e.g. English "en-US", "en-GB")
  const primaryMatch = voices.find((v) =>
    v.lang.toLowerCase().startsWith(primaryLang)
  );
  if (primaryMatch) return primaryMatch;

  // 4. Default voice designated by system
  const defaultVoice = voices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  // 5. Fallback to first available voice
  return voices[0] || null;
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    lang = "en-IN",
    rate = 0.95, // Slightly measured pace for medical clarity
    pitch = 1.0,
    volume = 1.0,
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSupported] = useState<boolean>(isSpeechSynthesisSupported);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Active utterance retention ref to prevent garbage collection
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const currentMessageIdRef = useRef<string | null>(null);

  // Latest callbacks in refs to avoid recreating the speak function
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // -------------------------------------------------------------------------
  // Voice discovery & voiceschanged lifecycle
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isSupported) return;

    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const available = synth.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    updateVoices();

    if (synth.onvoiceschanged !== undefined) {
      synth.addEventListener("voiceschanged", updateVoices);
    }

    return () => {
      synth.removeEventListener("voiceschanged", updateVoices);
    };
  }, [isSupported]);

  // -------------------------------------------------------------------------
  // Stop & Cancellation
  // -------------------------------------------------------------------------
  const stop = useCallback(() => {
    if (!isSupported) return;

    isCancelledRef.current = true;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore errors during cancel
    }

    activeUtteranceRef.current = null;
    currentMessageIdRef.current = null;
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [isSupported]);

  // -------------------------------------------------------------------------
  // Speak
  // -------------------------------------------------------------------------
  const speak = useCallback(
    (messageId: string, rawText: string) => {
      if (!isSupported) return;

      // 1. Sanitize Markdown and expand clinical abbreviations
      const cleanText = sanitizeForSpeech(rawText);
      if (!cleanText.trim()) return;

      // 2. Cancel any active speech session before starting a new one
      stop();

      isCancelledRef.current = false;
      currentMessageIdRef.current = messageId;
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);

      // 3. Chunk text into sentence-sized units under 140 characters
      const chunks = chunkTextForSpeech(cleanText, 140);
      if (chunks.length === 0) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }

      const voice = resolveBestVoice(voices, lang);

      // 4. Sequential chunk playback
      const playChunk = (index: number) => {
        if (isCancelledRef.current || currentMessageIdRef.current !== messageId) {
          return;
        }

        if (index >= chunks.length) {
          // Finished all chunks cleanly
          activeUtteranceRef.current = null;
          currentMessageIdRef.current = null;
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          onEndRef.current?.(messageId);
          return;
        }

        const chunkText = chunks[index];
        const utterance = new SpeechSynthesisUtterance(chunkText);

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = lang;
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => {
          if (index === 0) {
            onStartRef.current?.(messageId);
          }
        };

        utterance.onend = () => {
          if (!isCancelledRef.current && currentMessageIdRef.current === messageId) {
            playChunk(index + 1);
          }
        };

        utterance.onerror = (event) => {
          // Ignore canceled and interrupted events triggered by user stop or message change
          if (
            event.error === "canceled" ||
            event.error === "interrupted" ||
            isCancelledRef.current
          ) {
            return;
          }

          activeUtteranceRef.current = null;
          currentMessageIdRef.current = null;
          setIsSpeaking(false);
          setSpeakingMessageId(null);
          onErrorRef.current?.(messageId, event.error);
        };

        // Retain reference to prevent premature garbage collection
        activeUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      playChunk(0);
    },
    [isSupported, voices, lang, rate, pitch, volume, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    speakingMessageId,
    voices,
    speak,
    stop,
  };
}
