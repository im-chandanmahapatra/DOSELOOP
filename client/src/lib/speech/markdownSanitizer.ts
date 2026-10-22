/**
 * markdownSanitizer.ts
 * Sanitizes rich Markdown content and splits text into speech-friendly chunks
 * for browser-native Text-to-Speech (TTS).
 */

import { expandMedicalAbbreviations } from "./medicalPhonetics";

/**
 * Strips Markdown formatting while preserving clinical meaning, punctuation,
 * and natural pauses between instructions.
 */
export function sanitizeForSpeech(markdown: string): string {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  // Normalize Windows CRLF line-endings to standard LF
  let text = markdown.replace(/\r\n/g, "\n");

  // 1. Remove Markdown images completely
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // 2. Convert Markdown links [Label](url) -> Label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 3. Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, "");

  // 4. Remove inline code backticks `code` -> code
  text = text.replace(/`([^`]+)`/g, "$1");

  // 5. Convert headers to punctuated sentences (# Header -> Header.)
  text = text.replace(/^#{1,6}\s+(.+)$/gm, "$1.");

  // 6. Convert bulleted and numbered lists to punctuated clauses
  text = text.replace(/^\s*[-*+]\s+(.+)$/gm, "$1.");
  text = text.replace(/^\s*\d+\.\s+(.+)$/gm, "$1.");

  // 7. Remove blockquote markers
  text = text.replace(/^\s*>\s+/gm, "");

  // 8. Remove bold and italic markers
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");

  // 9. Remove strikethrough ~~text~~ -> text
  text = text.replace(/~~(.*?)~~/g, "$1");

  // 10. Handle Markdown tables: replace pipe dividers with commas and sentence ends
  text = text.replace(/^\s*\|[-:\s|]+\|\s*$/gm, ""); // Remove separator row |---|---|
  text = text.replace(/^\s*\|\s*/gm, "");            // Remove leading pipe
  text = text.replace(/\s*\|\s*$/gm, ".");           // Replace trailing pipe with period
  text = text.replace(/\s*\|\s*/g, ", ");            // Replace interior pipes with comma

  // 11. Remove horizontal rules
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, "");

  // 12. Expand medical abbreviations and dosages
  text = expandMedicalAbbreviations(text);

  // 13. Clean up excessive punctuation and whitespace
  text = text.replace(/\.{2,}/g, ".");              // Fix multiple periods
  text = text.replace(/([.!?])\s*([.!?])/g, "$1");    // Deduplicate adjacent punctuation
  text = text.replace(/\s+/g, " ");                 // Normalize whitespace
  text = text.trim();

  return text;
}

/**
 * Splits sanitized text into bite-sized sentence chunks (under maxChunkLength characters).
 *
 * CRITICAL WORKAROUND:
 * Chromium-based browsers (Chrome, Edge) silently freeze or stop firing onend events
 * on utterances that run longer than ~14-15 seconds. Chunking ensures every utterance
 * completes in 3-5 seconds, bypassing the bug completely.
 */
export function chunkTextForSpeech(text: string, maxChunkLength = 150): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return [];
  }

  // If text is already under limit, return as single chunk
  if (trimmed.length <= maxChunkLength) {
    return [trimmed];
  }

  // 1. First split by sentence boundaries (. ! ?)
  const rawSentences = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [trimmed];

  // 2. Further split any individual sentence that is longer than maxChunkLength by punctuation clauses (, ; : \n)
  const segments: string[] = [];
  for (const sentence of rawSentences) {
    const s = sentence.trim();
    if (!s) continue;

    if (s.length <= maxChunkLength) {
      segments.push(s);
    } else {
      const subClauses = s.match(/[^,;:\n]+[,;:\n]+|[^,;:\n]+$/g) || [s];
      for (const clause of subClauses) {
        const c = clause.trim();
        if (c) {
          segments.push(c);
        }
      }
    }
  }

  // 3. Assemble segments into chunks up to maxChunkLength
  const chunks: string[] = [];
  let currentChunk = "";

  for (const segment of segments) {
    if (!currentChunk) {
      currentChunk = segment;
    } else if ((currentChunk + " " + segment).length <= maxChunkLength) {
      currentChunk += " " + segment;
    } else {
      chunks.push(currentChunk);
      currentChunk = segment;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
