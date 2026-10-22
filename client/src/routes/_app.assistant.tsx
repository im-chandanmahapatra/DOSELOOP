import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Send,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  Square,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/PageHeader";
import { AiBadge } from "@/components/brand/AiBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher, updater } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const assistantSuggestions = [
  "What foods should I avoid with Lisinopril?",
  "What are common symptoms of dehydration?",
  "How does the Family Circle caregiver feature work?",
  "What should I do if I miss a morning dose of Metformin?",
];

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({ meta: [{ title: "Assistant — DoseLoop" }] }),
  component: Assistant,
});

// ---------------------------------------------------------------------------
// Markdown message bubble — renders AI responses with proper formatting
// ---------------------------------------------------------------------------
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-2 mt-3 text-base font-bold text-foreground first:mt-0 font-serif">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-1.5 mt-3 text-sm font-semibold text-foreground first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 mt-2 text-sm font-semibold text-muted-foreground first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => <p className="mb-2 text-sm leading-relaxed last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-1 text-sm last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-1 text-sm last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
        hr: () => <hr className="my-3 border-border" />,
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-primary pl-3 text-sm italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              <code>{children}</code>
            </pre>
          ) : (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-semibold text-foreground">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border-t border-border px-3 py-2 text-muted-foreground">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ---------------------------------------------------------------------------
// Assistant response bubble with copy, listen, and turn disclaimer
// ---------------------------------------------------------------------------
function AssistantBubble({
  id,
  content,
  isSpeaking,
  ttsSupported,
  onToggleSpeech,
}: {
  id: string;
  content: string;
  isSpeaking: boolean;
  ttsSupported: boolean;
  onToggleSpeech: (id: string, text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5 max-w-[90%] sm:max-w-[80%]">
      <div
        className={cn(
          "rounded-2xl border bg-card p-4 shadow-soft transition-all duration-200",
          isSpeaking ? "border-primary/60 ring-1 ring-primary/20 shadow-glow" : "border-border/80",
        )}
      >
        <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5 text-accent" /> Pulse AI
            {isSpeaking && (
              <span
                className="ml-1 inline-flex items-center gap-0.5 text-primary"
                title="Playing response aloud"
                aria-label="Audio playback active"
              >
                <span
                  className="size-1 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="size-1 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            {ttsSupported && (
              <button
                type="button"
                onClick={() => onToggleSpeech(id, content)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all",
                  isSpeaking
                    ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={isSpeaking ? "Stop reading aloud" : "Listen to answer"}
                aria-label={isSpeaking ? "Stop reading aloud" : "Listen to answer"}
              >
                {isSpeaking ? (
                  <>
                    <Square className="size-3 fill-current" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy response to clipboard"
              aria-label="Copy response to clipboard"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
        <MarkdownMessage content={content} />
      </div>
      <p className="px-2 text-[10px] text-muted-foreground/75">
        Health guidance only · Verify medication decisions with your doctor or pharmacist
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Assistant page
// ---------------------------------------------------------------------------
function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Speech Recognition (STT) hook
  const speechRecognition = useSpeechRecognition({
    lang: "en-IN",
    onFinalResult: (finalText) => {
      setInput((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${finalText}` : finalText;
      });
      textareaRef.current?.focus();
    },
    onError: (msg) => {
      toast.error(msg);
    },
  });

  // Speech Synthesis (TTS) hook
  const speechSynthesis = useSpeechSynthesis({
    lang: "en-IN",
    rate: 0.95,
    onError: (_id, err) => {
      toast.error(`Speech playback issue: ${err}`);
    },
  });

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/ai/history"],
    queryFn: () => fetcher("/ai/history"),
  });

  // Sync loaded history to local state on first load
  useEffect(() => {
    if (history.length > 0 && messages.length === 0) {
      setMessages(
        history.map((h: { id: string; role: string; content: string }) => ({
          id: h.id ?? crypto.randomUUID(),
          role: h.role === "ASSISTANT" ? "assistant" : ("user" as "user" | "assistant"),
          content: h.content,
        })),
      );
    }
  }, [history, messages.length]);

  // Track chat start
  useEffect(() => {
    trackEvent("ai_chat_started");
  }, []);

  // Auto-scroll to bottom whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const aiMutation = useMutation({
    mutationFn: (userMessage: string) => updater("/ai/chat", { message: userMessage }, "POST"),
    onSuccess: (res: { success: boolean; data: { message: string; fromApi: boolean } }) => {
      const reply = res?.data?.message ?? "No response received.";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Unable to connect to the assistant service right now. Please try again in a moment.",
        },
      ]);
    },
  });

  const send = (text: string) => {
    const value = text.trim();
    if (!value || aiMutation.isPending) return;
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    }
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: value }]);
    setInput("");
    trackEvent("ai_message_sent");
    aiMutation.mutate(value);
  };

  const handleClear = () => {
    speechSynthesis.stop();
    speechRecognition.stopListening();
    setMessages([]);
    queryClient.invalidateQueries({ queryKey: ["/ai/history"] });
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-4 lg:h-[calc(100vh-5rem)]">
      <PageHeader
        eyebrow="AI Health Partner"
        title="Ask about your health & medications"
        description="Evidence-based, structured wellness & regimen guidance. Never diagnostic."
      />

      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border/80 bg-card shadow-soft overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-2">
            <AiBadge label="Pulse AI" />
            <span className="text-xs text-muted-foreground">
              Educational reference · Non-diagnostic
            </span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Clear conversation"
            >
              <RotateCcw className="size-3" />
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-soft">
                <Sparkles className="size-7" />
              </div>
              <div>
                <p className="text-base font-serif font-semibold text-foreground">
                  Ask Pulse AI anything
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Medications interactions, missed dose protocols, hydration, or navigating DoseLoop
                  features.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {assistantSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary text-left shadow-xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" ? (
                <AssistantBubble
                  id={m.id}
                  content={m.content}
                  isSpeaking={
                    speechSynthesis.isSpeaking && speechSynthesis.speakingMessageId === m.id
                  }
                  ttsSupported={speechSynthesis.isSupported}
                  onToggleSpeech={(id, text) => {
                    if (speechSynthesis.isSpeaking && speechSynthesis.speakingMessageId === id) {
                      speechSynthesis.stop();
                    } else {
                      speechSynthesis.speak(id, text);
                    }
                  }}
                />
              ) : (
                <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-soft">
                  {m.content}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {aiMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-soft">
                <Sparkles className="size-3.5 animate-pulse text-accent" />
                <span className="text-xs text-muted-foreground">Pulse AI is thinking…</span>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-primary/60"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input composer with multi-line expand and keyboard send */}
        <div className="border-t border-border/80 bg-background/60 p-4">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about medications, interactions, symptoms, or habits… (Enter to send, Shift+Enter for new line)"
                className="min-h-[46px] max-h-32 resize-none rounded-2xl border-border/80 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary shadow-xs"
                aria-label="Message the assistant"
                disabled={aiMutation.isPending}
              />
            </div>
            <Button
              type="button"
              variant={speechRecognition.isListening ? "destructive" : "outline"}
              size="icon"
              className={cn(
                "size-11 shrink-0 rounded-xl transition-all duration-200",
                speechRecognition.isListening &&
                  "animate-pulse ring-2 ring-destructive/40 shadow-glow",
                !speechRecognition.isSupported && "opacity-60 cursor-not-allowed",
              )}
              onClick={() => {
                if (!speechRecognition.isSupported) {
                  toast.info(
                    "Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Apple Safari.",
                  );
                  return;
                }
                if (speechRecognition.isListening) {
                  speechRecognition.stopListening();
                } else {
                  speechRecognition.startListening();
                }
              }}
              disabled={aiMutation.isPending}
              title={
                !speechRecognition.isSupported
                  ? "Voice input not supported in this browser (use Chrome, Edge, or Safari)"
                  : speechRecognition.isListening
                    ? "Stop listening"
                    : "Start voice input (microphone)"
              }
              aria-label={
                !speechRecognition.isSupported
                  ? "Voice input not supported"
                  : speechRecognition.isListening
                    ? "Stop listening"
                    : "Start voice input"
              }
            >
              {speechRecognition.isListening ? (
                <Square className="size-4 fill-current text-destructive-foreground" />
              ) : (
                <Mic
                  className={cn(
                    "size-4",
                    speechRecognition.isSupported ? "text-foreground" : "text-muted-foreground/60",
                  )}
                />
              )}
            </Button>
            <Button
              type="submit"
              variant="wine"
              size="icon"
              className="size-11 shrink-0 rounded-xl"
              aria-label="Send message"
              disabled={!input.trim() || aiMutation.isPending}
            >
              <Send className="size-4" />
            </Button>
          </form>

          {/* Real-time listening indicator with live interim transcript */}
          {speechRecognition.isListening && (
            <div
              className="mt-2.5 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs text-primary animate-fade-in"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-destructive"></span>
              </span>
              <span className="font-semibold text-foreground">Listening…</span>
              <span className="text-muted-foreground truncate italic">
                {speechRecognition.interimTranscript ||
                  "Speak your question clearly (e.g. dosage, side effects, interactions)…"}
              </span>
              <button
                type="button"
                onClick={speechRecognition.stopListening}
                className="ml-auto shrink-0 text-[11px] font-semibold underline text-primary hover:text-primary-deep"
              >
                Done
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span>
              Press{" "}
              <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                Shift+Enter
              </kbd>{" "}
              for new line
            </span>
            <span className="hidden sm:inline">Protected by private in-memory context</span>
          </div>
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
        Pulse AI provides health information, not medical advice. In a life-threatening emergency,
        call National Emergency 112 (ERSS India) immediately.
      </p>
    </div>
  );
}
