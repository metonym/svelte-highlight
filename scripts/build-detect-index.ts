import type { GrammarIR } from "../src/engine.d.ts";
import { writeTo } from "./utils/write-to.ts";

/**
 * A feature is plain text when its weight is the default (1) or a
 * `[text, weight]` tuple when it's explicitly higher/lower. Keeping the
 * common case (weight 1) untupled roughly halves the table's size relative
 * to always-tupled encoding. Text is pre-lowercased at build time for
 * case-insensitive grammars so tier-0 scoring never lowercases per-feature.
 */
type Feature = string | [text: string, weight: number];

/** [language name, caseInsensitive (0|1), features]. Sorted by name. */
export type DetectIndexEntry = [
  name: string,
  caseInsensitive: 0 | 1,
  features: Feature[],
];

const DEFAULT_WEIGHT = 1;

function toFeature(text: string, weight: number): Feature {
  return weight === DEFAULT_WEIGHT ? text : [text, weight];
}

const KEYWORD_FEATURE_CAP = 15;
const LITERAL_FEATURE_CAP = 4;
const MIN_KEYWORD_LENGTH = 2;
const MIN_LITERAL_LENGTH = 3;
const SIZE_BUDGET_BYTES = 40 * 1024;

/**
 * `built_in`/`variable.language`-kind entries are standard-library globals
 * (`Array`, `console`, `window`, ...), not syntax - identifier vocabulary
 * that's frequently shared verbatim across unrelated C-family languages, so
 * it's a weak fingerprint at best and, worse, crowds out the actual syntax
 * keywords (`const`, `class`, `async`) later in a large grammar's table
 * from ever surviving the per-language cap.
 */
const EXCLUDED_KEYWORD_KINDS = new Set(["built_in", "variable.language"]);

/**
 * Rank among tied relevance (the overwhelming common case). Lower is
 * selected first. `keyword`-kind entries (control flow, declarations) are a
 * language's actual syntax; `type`/`literal` (primitive type names,
 * true/false/null) are a rung below; anything else falls through to a
 * shared low priority. Without this, a grammar that happens to *declare*
 * its type-name keywords before its syntax keywords (rust: `i8`..`Vec`
 * precede `fn`/`let`/`struct`/`match`/`impl` in the source hljs table) has
 * its entire syntax vocabulary silently excluded by the cap - every
 * relevance-1 entry ties, so a plain declaration-order tiebreak just takes
 * whichever kind happened to be declared first.
 */
const KEYWORD_KIND_PRIORITY: Record<string, number> = {
  keyword: 0,
  type: 1,
  literal: 1,
};
const DEFAULT_KEYWORD_KIND_PRIORITY = 2;

/**
 * Highest relevance seen per word, across every state's keyword table
 * (not just the root state - e.g. dockerfile's instruction keywords live in
 * a nested state). Relevance-0 ("off", hljs's marker for a keyword too
 * generic to score on), single-character words, and built-in/global-variable
 * kind entries (see `EXCLUDED_KEYWORD_KINDS`) are dropped.
 */
function collectKeywordCandidates(
  ir: GrammarIR,
): Map<string, { relevance: number; kind: string }> {
  const byWord = new Map<string, { relevance: number; kind: string }>();
  for (const state of ir.states) {
    if (!state.keywords) continue;
    for (const [word, tuple] of Object.entries(state.keywords)) {
      const [kind, relevance] = tuple;
      if (relevance < 1) continue;
      if (word.length < MIN_KEYWORD_LENGTH) continue;
      if (EXCLUDED_KEYWORD_KINDS.has(kind)) continue;
      const existing = byWord.get(word);
      if (existing === undefined || relevance > existing.relevance) {
        byWord.set(word, { relevance, kind });
      }
    }
  }
  return byWord;
}

// Regex-source characters that terminate a literal run when unescaped.
const METACHARS = new Set([
  ".",
  "^",
  "$",
  "*",
  "+",
  "?",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "|",
]);
// Escaped punctuation that decodes to itself (kept as a literal character);
// any other escape (\d, \w, \s, \b, \1, ...) is a non-literal class/backref.
const SAFE_ESCAPED = new Set([
  ".",
  "^",
  "$",
  "*",
  "+",
  "?",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "|",
  "\\",
  "/",
  "!",
  "@",
  "#",
  "%",
  "&",
  ":",
  ";",
  ",",
  "=",
  "'",
  '"',
  "~",
  "`",
  "<",
  ">",
  "_",
  "-",
]);

/**
 * Mechanically pulls literal (non-regex-metachar) substrings out of a
 * `begin`/`end` pattern source - e.g. `^#!/usr/bin/env` yields `#!/usr/bin/env`,
 * `@interface\\b` yields `@interface`. No hand-authored per-language text.
 *
 * Character classes (`[...]`) are skipped entirely rather than scanned as
 * literal text: `[a-zA-Z_]` describes a *set* of one-character matches, not
 * the literal substring "a-zA-Z_", and treating class bodies as literals
 * produced meaningless high-frequency noise features (`a-za-z`, `0-9_-`)
 * that drowned out real signal.
 */
function extractLiterals(pattern: string): string[] {
  const literals: string[] = [];
  let current = "";
  // Tracks whether we're inside `[...]` (a character class - its body is a
  // set spec, e.g. "a-zA-Z_") or `{...}` (a repetition quantifier, e.g.
  // "{0,2}"); both are skipped wholesale rather than scanned as literal
  // text, which previously produced meaningless features like "a-za-z" and
  // "0,2".
  let skipUntil: "]" | "}" | null = null;
  const flush = () => {
    if (current.length >= MIN_LITERAL_LENGTH) literals.push(current);
    current = "";
  };
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\") {
      const next = pattern[i + 1];
      if (!skipUntil && next && SAFE_ESCAPED.has(next)) current += next;
      else if (!skipUntil) flush();
      i++;
      continue;
    }
    if (skipUntil) {
      if (c === skipUntil) skipUntil = null;
      continue;
    }
    if (c === "[" || c === "{") {
      flush();
      skipUntil = c === "[" ? "]" : "}";
      continue;
    }
    if (c && METACHARS.has(c)) {
      flush();
      continue;
    }
    current += c;
  }
  flush();
  return literals;
}

function collectLiteralCandidates(ir: GrammarIR): Map<string, number> {
  const byLiteral = new Map<string, number>();
  for (const state of ir.states) {
    // No shipped grammar currently sets a non-default state.relevance (the
    // build strips relevance:1, the only value convert-language.js ever
    // emits today), so this is DEFAULT_WEIGHT in practice; kept as a
    // formula, not a hardcoded 1, so a future distinctive state naturally
    // outweighs an ordinary one instead of silently being ignored.
    const weight = state.relevance ?? DEFAULT_WEIGHT;
    for (const pattern of [state.begin, state.end]) {
      if (!pattern) continue;
      for (const literal of extractLiterals(pattern)) {
        const existing = byLiteral.get(literal);
        if (existing === undefined || weight > existing) {
          byLiteral.set(literal, weight);
        }
      }
    }
  }
  return byLiteral;
}

interface LanguageCandidates {
  ir: GrammarIR;
  keywords: Map<string, { relevance: number; kind: string }>;
  literals: Map<string, number>;
}

/**
 * Document frequency (how many languages' raw candidate pools contain this
 * exact word/literal) across both namespaces combined - a keyword in one
 * grammar and a literal in another still count toward the same weight for
 * that text.
 */
function computeDocumentFrequency(
  perLanguage: LanguageCandidates[],
): Map<string, number> {
  const df = new Map<string, number>();
  for (const { keywords, literals } of perLanguage) {
    for (const word of new Set([...keywords.keys(), ...literals.keys()])) {
      df.set(word, (df.get(word) ?? 0) + 1);
    }
  }
  return df;
}

/**
 * Inverse document frequency: how rare `word` is across the corpus
 * (`log2(languageCount / documentFrequency)`). Used only to decide which
 * *literal* candidates survive the per-language cap (see `rankLiterals`) -
 * it suppresses boilerplate shared by nearly every grammar, most notably
 * hljs's `TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX` doctag idiom (~215/234
 * grammars), whose idf rounds to ~0.
 */
function idf(
  word: string,
  documentFrequency: Map<string, number>,
  languageCount: number,
): number {
  const df = documentFrequency.get(word) ?? 1;
  return Math.log2(languageCount / df);
}

/**
 * Ranked, capped keyword features: relevance first, then kind priority (see
 * `KEYWORD_KIND_PRIORITY`). Ties within a (relevance, kind) pair (the
 * common case - most grammars leave every "keyword"-kind entry at the
 * default relevance) keep the grammar's own declaration order rather than
 * an idf/length/alpha bias: a keyword table is already curated by the
 * grammar author (unlike a begin/end pattern's incidental literal
 * substrings), and grammar authors overwhelmingly declare a language's
 * foundational keywords before its more obscure ones *within a kind* -
 * measured empirically against an even-sampled alternative (spread
 * selection across the whole tied group instead of taking the first N),
 * which fixed a couple of large-keyword-table cases but broke several times
 * as many by displacing exactly the common, sample-relevant words
 * (`contract`, `function`) the first-N slice was already keeping in favor
 * of rarer ones (`payable`, `ecrecover`) that happened to fall on its
 * stride.
 */
function rankKeywords(
  candidates: Map<string, { relevance: number; kind: string }>,
): [text: string, weight: number][] {
  return [...candidates.entries()]
    .sort(([, a], [, b]) => {
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;
      const aPriority =
        KEYWORD_KIND_PRIORITY[a.kind] ?? DEFAULT_KEYWORD_KIND_PRIORITY;
      const bPriority =
        KEYWORD_KIND_PRIORITY[b.kind] ?? DEFAULT_KEYWORD_KIND_PRIORITY;
      return aPriority - bPriority;
    })
    .slice(0, KEYWORD_FEATURE_CAP)
    .map(([word, { relevance }]) => [word, relevance]);
}

/**
 * Ranked, capped literal features. Selection (which literals survive the
 * cap) is ranked by idf, since literal extraction pulls in corpus-wide
 * boilerplate a keyword table never would; the *stored* weight is still the
 * grammar-declared one (from `collectLiteralCandidates`, always
 * `DEFAULT_WEIGHT` today), not the idf score - idf is a selection filter
 * here, not a scoring signal, so a survivor still elides to a bare string
 * the same as any other default-weight feature.
 *
 * A hard document-frequency cutoff was tried first (delete anything above a
 * threshold count) and measurably hurt recall: it can only "keep at full
 * weight" or "delete", so a moderately common but still useful word
 * (`import`, seen in 68/234 grammars) was deleted outright even where it
 * was a sample's only matching signal. Ranking by idf instead of filtering
 * by it keeps that word available whenever nothing rarer outranks it.
 */
function rankLiterals(
  candidates: Map<string, number>,
  documentFrequency: Map<string, number>,
  languageCount: number,
): [text: string, weight: number][] {
  return [...candidates.entries()]
    .sort(
      (a, b) =>
        idf(b[0], documentFrequency, languageCount) -
        idf(a[0], documentFrequency, languageCount),
    )
    .slice(0, LITERAL_FEATURE_CAP);
}

function buildEntry(
  candidates: LanguageCandidates,
  documentFrequency: Map<string, number>,
  languageCount: number,
): DetectIndexEntry | null {
  const { ir } = candidates;
  const pairs = [
    ...rankKeywords(candidates.keywords),
    ...rankLiterals(candidates.literals, documentFrequency, languageCount),
  ];
  if (pairs.length === 0) return null;
  const features = pairs.map(([text, weight]) =>
    toFeature(ir.caseInsensitive ? text.toLowerCase() : text, weight),
  );
  return [ir.name, ir.caseInsensitive ? 1 : 0, features];
}

/**
 * Emits `src/languages/detect-index.js` + `.d.ts`: a compact fingerprint
 * table, mechanically derived from each shipped grammar's final IR (so it
 * can never drift from the grammars themselves), consumed by tier 0 of
 * `svelte-highlight/auto-detect`.
 *
 * Takes `irByName` straight from `convertGrammars()`'s return value rather
 * than re-importing `src/languages/*.js` off disk: those files were just
 * overwritten by `convertGrammars()` in this same process, and the ESM
 * module cache would otherwise hand back the pre-conversion (hljs
 * function-based) modules `buildLanguages()` originally wrote.
 */
export async function buildDetectIndex(irByName: Map<string, GrammarIR>) {
  console.time("build detect index");

  const perLanguage: LanguageCandidates[] = [];
  for (const ir of irByName.values()) {
    if (ir.disableAutodetect) continue;
    perLanguage.push({
      ir,
      keywords: collectKeywordCandidates(ir),
      literals: collectLiteralCandidates(ir),
    });
  }

  const documentFrequency = computeDocumentFrequency(perLanguage);

  const table: DetectIndexEntry[] = [];
  for (const candidates of perLanguage) {
    const row = buildEntry(candidates, documentFrequency, perLanguage.length);
    if (row) table.push(row);
  }
  table.sort((a, b) => a[0].localeCompare(b[0]));

  const json = JSON.stringify(table);
  const sizeBytes = Buffer.byteLength(json, "utf8");

  const jsContent = `// Generated by scripts/build-detect-index.ts. Do not edit by hand.
/** @type {import("./detect-index.d.ts").DetectIndexEntry[]} */
const detectIndex = ${json};
export default detectIndex;
`;
  const dtsContent = `/** A bare string is a feature at the default weight (1). */
export type DetectIndexFeature = string | [text: string, weight: number];

export type DetectIndexEntry = [
  name: string,
  caseInsensitive: 0 | 1,
  features: DetectIndexFeature[],
];

declare const detectIndex: DetectIndexEntry[];
export default detectIndex;
`;

  await Promise.all([
    writeTo("src/languages/detect-index.js", jsContent),
    writeTo("src/languages/detect-index.d.ts", dtsContent),
  ]);

  console.log(
    `detect-index: ${table.length}/${irByName.size} languages, ` +
      `${(sizeBytes / 1024).toFixed(1)} KB (budget ${(SIZE_BUDGET_BYTES / 1024).toFixed(0)} KB)`,
  );
  if (sizeBytes > SIZE_BUDGET_BYTES) {
    throw new Error(
      `detect-index exceeds its size budget: ${sizeBytes} bytes > ${SIZE_BUDGET_BYTES} bytes`,
    );
  }
  console.timeEnd("build detect index");
}
