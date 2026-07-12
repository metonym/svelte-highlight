/**
 * Tiered lazy language detection - the headless half of `HighlightAuto`'s
 * default (no `languages` prop) path.
 *
 * Tier 0 (`detectCandidates`): scores raw `code` against
 * `./languages/detect-index.js`, a compact fingerprint table generated at
 * build time from every shipped grammar's IR (see
 * `scripts/build-detect-index.ts`). No grammars are loaded - this is a
 * plain-string substring scan over a table that's kilobytes, not the ~245
 * grammar modules `languages/all.js` used to cost.
 *
 * Tier 1 (`detectLanguage`): dynamically imports the tier-0 candidates (or
 * an explicit `languageNames` list, skipping tier 0 entirely), registers
 * them on the shared registry, and lets the engine's real relevance
 * competition (`registry.highlightAuto`) decide among them plus anything
 * already registered - so a user-registered custom grammar can still win
 * even though it has no entry in the fingerprint table.
 */
import { DETECT_SAMPLE_LIMIT } from "./engine.js";
import detectIndex from "./languages/detect-index.js";
import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

const WORD_CHAR_RE = /[A-Za-z0-9_]/;

/** @param {string} ch */
function isWordChar(ch) {
  return ch !== "" && WORD_CHAR_RE.test(ch);
}

/**
 * Substring search with a word-boundary guard for alphanumeric features (a
 * plain `.includes("fi")` would spuriously match inside "insufficient").
 * Punctuation-leading/trailing features (`"<!--"`, `":="`) fall back to a
 * plain substring search, since "boundary" isn't a meaningful concept for
 * them and they're rare enough not to need it.
 * @param {string} haystack
 * @param {string} needle
 */
function includesBounded(haystack, needle) {
  const isWordy =
    isWordChar(needle[0] ?? "") && isWordChar(needle[needle.length - 1] ?? "");
  if (!isWordy) return haystack.includes(needle);
  let from = 0;
  for (;;) {
    const index = haystack.indexOf(needle, from);
    if (index === -1) return false;
    const before = index > 0 ? (haystack[index - 1] ?? "") : "";
    const after =
      index + needle.length < haystack.length
        ? (haystack[index + needle.length] ?? "")
        : "";
    if (!isWordChar(before) && !isWordChar(after)) return true;
    from = index + 1;
  }
}

/**
 * @param {string} code
 * @returns {{ name: string, score: number, fraction: number }[]} every
 *   indexed language, scored and sorted best-first (ties broken by the
 *   fraction of that language's own feature weight matched - a language
 *   whose small vocabulary is mostly present in `code` outranks one that
 *   incidentally matched the same few common words out of a much larger
 *   table).
 */
function scoreAll(code) {
  const sample =
    code.length > DETECT_SAMPLE_LIMIT
      ? code.slice(0, DETECT_SAMPLE_LIMIT)
      : code;
  const lower = sample.toLowerCase();

  const scored = detectIndex.map(([name, caseInsensitive, features]) => {
    const haystack = caseInsensitive ? lower : sample;
    let score = 0;
    let total = 0;
    for (const feature of features) {
      const [text, weight] =
        typeof feature === "string" ? [feature, 1] : feature;
      total += weight;
      if (includesBounded(haystack, text)) score += weight;
    }
    return { name, score, fraction: total > 0 ? score / total : 0 };
  });

  scored.sort((a, b) => b.score - a.score || b.fraction - a.fraction);
  return scored;
}

/**
 * Tier 0 only: top-k candidate language names, best first. Sync, no
 * grammars loaded.
 * @param {string} code
 * @param {number} [k]
 * @returns {string[]}
 */
export function detectCandidates(code, k = 5) {
  const source = typeof code === "string" ? code : String(code ?? "");
  return scoreAll(source)
    .slice(0, k)
    .map((entry) => entry.name);
}

/**
 * Tier 0 + tier 1: loads top-k candidate grammars, registers them on the
 * shared registry, and runs the relevance competition among the candidates
 * plus all already-registered languages.
 * @param {string} code
 * @param {{ k?: number, languageNames?: string[] }} [options]
 * @returns {Promise<{ language: string | undefined, relevance: number }>}
 */
export async function detectLanguage(code, options = {}) {
  const { k = 5, languageNames } = options;
  const source = typeof code === "string" ? code : String(code ?? "");
  const candidateNames = languageNames ?? detectCandidates(source, k);

  const loaded = await Promise.allSettled(
    candidateNames.map((name) =>
      loadLanguage(/** @type {import("./languages").LanguageName} */ (name)),
    ),
  );
  for (const result of loaded) {
    if (result.status === "fulfilled") ensureRegistered(result.value);
  }

  const subset = [...new Set([...candidateNames, ...registry.listLanguages()])];
  const { language, relevance } = registry.highlightAuto(source, subset);
  return { language, relevance };
}
