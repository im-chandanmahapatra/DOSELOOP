/**
 * medicalPhonetics.ts
 * Clinical text expander for text-to-speech rendering in DoseLoop.
 *
 * Ensures critical medical abbreviations, Latin frequency instructions,
 * dosage units, and clinical acronyms are pronounced accurately by browser
 * speech synthesis engines without phonetic distortion.
 *
 * SAFETY MANDATE: Never simplify, remove, or alter medical dosages, frequencies,
 * warnings, or instructions. Expand abbreviations to clear, full words.
 */

interface AbbreviationRule {
  pattern: RegExp;
  replacement: string;
}

const MEDICAL_ABBREVIATIONS: AbbreviationRule[] = [
  // Dosage units - must handle both standalone and affixed (e.g. 500mg, 500 mg)
  { pattern: /\b(\d+(?:\.\d+)?)\s*mg\b/gi, replacement: "$1 milligrams" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*mcg\b/gi, replacement: "$1 micrograms" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*ml\b/gi, replacement: "$1 milliliters" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*kg\b/gi, replacement: "$1 kilograms" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*(?:g|gm)\b/gi, replacement: "$1 grams" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*mEq\b/gi, replacement: "$1 milliequivalents" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*IU\b/gi, replacement: "$1 International Units" },

  // Dosage units without leading numbers
  { pattern: /\bmg\b/gi, replacement: "milligrams" },
  { pattern: /\bmcg\b/gi, replacement: "micrograms" },
  { pattern: /\bml\b/gi, replacement: "milliliters" },

  // Dosage forms
  { pattern: /\btab(?:s)?\b/gi, replacement: "tablets" },
  { pattern: /\bcap(?:s)?\b/gi, replacement: "capsules" },
  { pattern: /\binj\b/gi, replacement: "injection" },
  { pattern: /\bsyr\b/gi, replacement: "syrup" },

  // Latin frequency abbreviations
  { pattern: /\b(?:BID|b\.i\.d\.)\b/gi, replacement: "twice a day" },
  { pattern: /\b(?:TID|t\.i\.d\.)\b/gi, replacement: "three times a day" },
  { pattern: /\b(?:QID|q\.i\.d\.)\b/gi, replacement: "four times a day" },
  { pattern: /\b(?:QD|q\.d\.)\b/gi, replacement: "once daily" },
  { pattern: /\b(?:QOD|q\.o\.d\.)\b/gi, replacement: "every other day" },
  { pattern: /\b(?:PRN|p\.r\.n\.)\b/gi, replacement: "as needed" },
  { pattern: /\b(?:HS|h\.s\.)\b/gi, replacement: "at bedtime" },
  { pattern: /\b(?:AC|a\.c\.)\b/gi, replacement: "before meals" },
  { pattern: /\b(?:PC|p\.c\.)\b/gi, replacement: "after meals" },

  // Hour intervals
  { pattern: /\bq(\d+)h\b/gi, replacement: "every $1 hours" },
  { pattern: /\bq\s*(\d+)\s*h(?:ours?)?\b/gi, replacement: "every $1 hours" },

  // Route abbreviations
  { pattern: /\b(?:PO|p\.o\.)\b/g, replacement: "by mouth" },
  { pattern: /\bIV\b/g, replacement: "intravenously" },
  { pattern: /\bIM\b/g, replacement: "intramuscularly" },
  { pattern: /\b(?:SC|subq)\b/gi, replacement: "subcutaneously" },

  // Clinical terms & vitals
  { pattern: /\bBP\b/g, replacement: "blood pressure" },
  { pattern: /\bHR\b/g, replacement: "heart rate" },
  { pattern: /\bRx\b/gi, replacement: "prescription" },
  { pattern: /\bOTC\b/g, replacement: "over the counter" },
  { pattern: /\bNSAID(?:s)?\b/gi, replacement: "non-steroidal anti-inflammatory drugs" },
  { pattern: /\be\.g\.,?\b/gi, replacement: "for example," },
  { pattern: /\bi\.e\.,?\b/gi, replacement: "that is," },
  { pattern: /\bw\/\b/gi, replacement: "with" },
  { pattern: /\bw\/o\b/gi, replacement: "without" },
];

/**
 * Expands medical abbreviations and clinical shorthand into spoken equivalents.
 * Preserves numbers, warnings, and sentence structure.
 */
export function expandMedicalAbbreviations(text: string): string {
  if (!text) return "";

  let result = text;
  for (const rule of MEDICAL_ABBREVIATIONS) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  return result;
}
