import type { GrammarIR } from "../src/engine.d.ts";
import { buildLanguageEntries } from "./build-languages.ts";
import { writeTo } from "./utils/write-to.ts";

/**
 * `[name, caseInsensitive, features]`, in all.js order. `features` is
 * space-separated. Each feature starts with one base-36 digit, its weight.
 */
type DetectIndexEntry = [name: string, caseInsensitive: 0 | 1, string];

const KEYWORD_CAP = 40;
const LITERAL_CAP = 6;
const MIN_KEYWORD_LENGTH = 2;
const MIN_LITERAL_LENGTH = 3;
const SIZE_BUDGET_BYTES = 96 * 1024;
// One base-36 digit.
const MAX_WEIGHT = 35;

const EXCLUDED_KINDS = new Set(["built_in", "variable.language"]);
const KIND_PRIORITY: Record<string, number> = {
  keyword: 0,
  type: 1,
  literal: 1,
};
const DEFAULT_KIND_PRIORITY = 2;

type KeywordInfo = { relevance: number; kind: string };

/** Expands `state.keywords` (an index into `keywordTables` after compaction). */
function stateKeywords(
  ir: GrammarIR,
  keywords: NonNullable<GrammarIR["states"][number]["keywords"]>,
): [word: string, kind: string, relevance: number][] {
  if (typeof keywords !== "number") {
    return Object.entries(keywords).map(([word, [kind, relevance]]) => [
      word,
      kind,
      relevance,
    ]);
  }
  const table = ir.keywordTables?.[keywords] ?? [];
  return table.flatMap(([kind, relevance, words]) =>
    words
      .split(" ")
      .map((word): [string, string, number] => [word, kind, relevance]),
  );
}

function collectKeywords(ir: GrammarIR): Map<string, KeywordInfo> {
  const byWord = new Map<string, KeywordInfo>();
  for (const state of ir.states) {
    if (state.keywords == null) continue;
    for (const [word, kind, relevance] of stateKeywords(ir, state.keywords)) {
      if (relevance < 1) continue;
      if (word.length < MIN_KEYWORD_LENGTH) continue;
      if (EXCLUDED_KINDS.has(kind)) continue;
      const existing = byWord.get(word);
      if (existing === undefined || relevance > existing.relevance) {
        byWord.set(word, { relevance, kind });
      }
    }
  }
  return byWord;
}

// Unescaped, these end a literal run.
const METACHARS = new Set([...".^$*+?()[]{}|"]);
// Escaped, these stand for themselves. Any other escape (\d, \b, \1) is
// a class or a backreference, and ends the run.
const SAFE_ESCAPED = new Set([...".^$*+?()[]{}|\\/!@#%&:;,='\"~`<>_-"]);

/**
 * Pulls the literal runs out of a regex source: `^#!/usr/bin/env`
 * gives `#!/usr/bin/env`. Skips `[...]` classes, `{n,m}` counts, group
 * prefixes, and any character a quantifier makes optional.
 */
function extractLiterals(pattern: string): string[] {
  const literals: string[] = [];
  let current = "";
  let skipUntil: "]" | "}" | null = null;
  const flush = () => {
    if (current.length >= MIN_LITERAL_LENGTH) literals.push(current);
    current = "";
  };
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i] as string;
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
    if (c === "[") {
      flush();
      skipUntil = "]";
      continue;
    }
    if (c === "(" && pattern[i + 1] === "?") {
      // A group prefix: (?: (?= (?! (?<= (?<! (?<name>. None of it is text.
      flush();
      const prefix = /^\(\?(?:<[=!]|<[\w$]+>|[:=!])/.exec(pattern.slice(i));
      i += (prefix?.[0].length ?? 2) - 1;
      continue;
    }
    if (c === "?" || c === "*" || c === "{") {
      // The previous character is optional (or counted), so it is not
      // part of a literal run.
      current = current.slice(0, -1);
    }
    if (METACHARS.has(c)) {
      flush();
      if (c === "{") skipUntil = "}";
      continue;
    }
    current += c;
  }
  flush();
  return literals;
}

function collectLiterals(ir: GrammarIR): Set<string> {
  const literals = new Set<string>();
  for (const state of ir.states) {
    for (const pattern of [state.begin, state.end]) {
      if (!pattern) continue;
      for (const literal of extractLiterals(pattern)) literals.add(literal);
    }
  }
  return literals;
}

/** Direct `subLanguage` names, without the grammar itself. */
function collectSubLanguages(ir: GrammarIR): string[] {
  const names = new Set<string>();
  for (const { subLanguage } of ir.states) {
    for (const name of [subLanguage ?? []].flat()) {
      if (name !== ir.name) names.add(name);
    }
  }
  return [...names];
}

interface Candidates {
  ir: GrammarIR;
  keywords: Map<string, KeywordInfo>;
  literals: Set<string>;
}

function buildEntry(
  { ir, keywords, literals }: Candidates,
  idf: (text: string) => number,
): DetectIndexEntry | null {
  // Rare text says more about the language, so idf scales each weight.
  const weigh = (text: string, relevance: number) => relevance * idf(text);
  const rankedKeywords = [...keywords.entries()]
    .sort(([, a], [, b]) => {
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;
      return (
        (KIND_PRIORITY[a.kind] ?? DEFAULT_KIND_PRIORITY) -
        (KIND_PRIORITY[b.kind] ?? DEFAULT_KIND_PRIORITY)
      );
    })
    .slice(0, KEYWORD_CAP)
    .map(([word, { relevance }]): [string, number] => [
      word,
      weigh(word, relevance),
    ]);
  const rankedLiterals = [...literals]
    .filter((literal) => !keywords.has(literal))
    .sort((a, b) => idf(b) - idf(a))
    .slice(0, LITERAL_CAP)
    .map((literal): [string, number] => [literal, weigh(literal, 1)]);
  const pairs = [...rankedKeywords, ...rankedLiterals];
  const seen = new Set<string>();
  const features: string[] = [];
  for (const [text, weight] of pairs) {
    const value = ir.caseInsensitive ? text.toLowerCase() : text;
    // Spaces separate features, so a literal with whitespace can't be one.
    if (/\s/.test(value) || seen.has(value)) continue;
    seen.add(value);
    const level = Math.min(MAX_WEIGHT, Math.max(1, Math.round(weight)));
    features.push(level.toString(36) + value);
  }
  if (features.length === 0) return null;
  return [ir.name, ir.caseInsensitive ? 1 : 0, features.join(" ")];
}

async function loadIrs(): Promise<GrammarIR[]> {
  // The query skips the module cache: earlier build steps imported the
  // pre-conversion modules under the same paths.
  const modules = await Promise.all(
    buildLanguageEntries().map(
      (entry) =>
        import(`../src/languages/${entry.name}.js?detect-index`) as Promise<{
          default: { register: GrammarIR };
        }>,
    ),
  );
  return modules.map((module) => module.default.register);
}

/**
 * Writes `src/languages/detect-index.js`: a small fingerprint table that
 * `src/auto-detect.js` scores code against to pick candidate grammars
 * without loading any of them. Also writes `src/languages/loaders.js`,
 * which `src/auto-detect.js` uses to import them. Must run after
 * `convertGrammars()`.
 */
export async function buildDetectIndex() {
  console.time("build detect index");
  const irs = await loadIrs();

  const subLanguages: Record<string, string[]> = {};
  for (const ir of irs) {
    const names = collectSubLanguages(ir);
    if (names.length > 0) subLanguages[ir.name] = names;
  }

  const pool: Candidates[] = irs
    .filter((ir) => !ir.disableAutodetect)
    .map((ir) => ({
      ir,
      keywords: collectKeywords(ir),
      literals: collectLiterals(ir),
    }));

  // Document frequency: how many grammars carry each text.
  const df = new Map<string, number>();
  for (const { keywords, literals } of pool) {
    for (const text of new Set([...keywords.keys(), ...literals])) {
      df.set(text, (df.get(text) ?? 0) + 1);
    }
  }
  const idf = (text: string) => Math.log2(pool.length / (df.get(text) ?? 1));

  const index = pool
    .map((candidates) => buildEntry(candidates, idf))
    .filter((entry) => entry !== null);

  const indexJson = JSON.stringify(index);
  const subLanguagesJson = JSON.stringify(subLanguages);
  const bytes = indexJson.length + subLanguagesJson.length;

  // Literal specifiers, one per grammar. Bundlers can follow these even
  // from node_modules, where Vite skips template-literal `import()`.
  const loaderLines = buildLanguageEntries().map(
    ({ name }) => `  ${JSON.stringify(name)}: () => import("./${name}.js"),`,
  );

  await Promise.all([
    writeTo(
      "src/languages/loaders.js",
      `/*!
 * Generated by scripts/build-detect-index.ts. Do not edit by hand.
 */
/** @type {import("./loaders.d.ts").Loaders} */
export const LOADERS = {
${loaderLines.join("\n")}
};
`,
    ),
    writeTo(
      "src/languages/loaders.d.ts",
      `import type { LanguageType } from "./index.d.ts";

export type Loaders = Readonly<
  Record<string, () => Promise<{ default: LanguageType<string> }>>
>;

/** Grammar name to a function that imports its module. */
export declare const LOADERS: Loaders;
`,
    ),
    writeTo(
      "src/languages/detect-index.js",
      `/*!
 * Generated by scripts/build-detect-index.ts. Do not edit by hand.
 */
export const DETECT_INDEX = /** @type {import("./detect-index.d.ts").DetectIndexEntry[]} */ (${indexJson});

export const SUB_LANGUAGES = /** @type {Record<string, string[]>} */ (${subLanguagesJson});
`,
    ),
    writeTo(
      "src/languages/detect-index.d.ts",
      `/**
 * \`[name, caseInsensitive, features]\`, in \`all.js\` order. \`features\`
 * is space-separated. Each feature starts with one base-36 digit, its
 * weight.
 */
export type DetectIndexEntry = [
  name: string,
  caseInsensitive: 0 | 1,
  features: string,
];

/** One fingerprint per grammar that takes part in auto-detection. */
export declare const DETECT_INDEX: DetectIndexEntry[];

/** Grammar name to the grammars it embeds through \`subLanguage\`. */
export declare const SUB_LANGUAGES: Readonly<Record<string, string[]>>;
`,
    ),
  ]);

  console.log(
    `detect-index: ${index.length}/${irs.length} grammars, ${(bytes / 1024).toFixed(1)} KB`,
  );
  if (bytes > SIZE_BUDGET_BYTES) {
    throw new Error(
      `detect-index: ${bytes} bytes is over the ${SIZE_BUDGET_BYTES}-byte budget`,
    );
  }
  console.timeEnd("build detect index");
}
