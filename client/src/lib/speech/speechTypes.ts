/**
 * speechTypes.ts
 * Type definitions and interfaces for DoseLoop browser-native speech modules.
 */

// ---------------------------------------------------------------------------
// SpeechRecognition Types & Browser Interface Polyfills
// ---------------------------------------------------------------------------

export type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message?: string;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface ISpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudiostart: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onsoundstart: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onspeechstart: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onspeechend: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onsoundend: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onaudioend: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onnomatch: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type SpeechRecognitionConstructor = new () => ISpeechRecognitionInstance;

// ---------------------------------------------------------------------------
// Hook Interfaces
// ---------------------------------------------------------------------------

export interface UseSpeechRecognitionOptions {
  lang?: string;
  onFinalResult?: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string, code: SpeechRecognitionErrorCode) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  abortListening: () => void;
  resetTranscript: () => void;
}

export interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: (messageId: string) => void;
  onEnd?: (messageId: string) => void;
  onError?: (messageId: string, error: string) => void;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speakingMessageId: string | null;
  voices: SpeechSynthesisVoice[];
  speak: (messageId: string, rawText: string) => void;
  stop: () => void;
}
