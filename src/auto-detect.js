// Lazy language detection, in two steps:
//
// 1. `detectCandidates` scores code against a generated fingerprint index
//    (languages/detect-index.js, built by scripts/build-detect-index.ts)
//    and returns a few likely grammar names. It loads no grammars.
// 2. `highlightAutoLazy` imports only those grammars (plus the grammars
//    they embed), registers them, and lets `Registry#highlightAuto` pick
//    among them and every grammar already registered.
//
// So a page pays for the index and the grammars its code needs, not for
// every grammar that `languages/all.js` imports.
import { registerAll } from "./engine.js";
import { DETECT_INDEX, SUB_LANGUAGES } from "./languages/detect-index.js";
import { LOADERS } from "./languages/loaders.js";
import { LanguageLoadError } from "./load-language.js";
import { registry as sharedRegistry } from "./registry.js";

/** How many fingerprint candidates `highlightAutoLazy` loads by default. */
export const DEFAULT_CANDIDATES = 5;

// Fingerprints only need the start of the code. Same cap as the engine's
// detection sample.
const SAMPLE_LIMIT = 8000;
const WORD_RE = /\w+/g;
const WORD_ONLY_RE = /^\w+$/;

/**
 * @typedef {{ name: string, caseInsensitive: boolean, total: number,
 *   words: [string, number][], literals: [string, number][] }} Fingerprint
 */

/** @type {Fingerprint[] | undefined} */
let fingerprints;
/** @type {Map<string, number> | undefined} */
let indexOrder;

/** Parses the index once, on first use. */
function getFingerprints() {
  fingerprints ??= DETECT_INDEX.map(([name, caseInsensitive, features]) => {
    /** @type {Fingerprint} */
    const fingerprint = {
      name,
      caseInsensitive: caseInsensitive === 1,
      total: 0,
      words: [],
      literals: [],
    };
    for (const feature of features.split(" ")) {
      const weight = Number.parseInt(feature[0] ?? "1", 36);
      const value = feature.slice(1);
      fingerprint.total += weight;
      (WORD_ONLY_RE.test(value)
        ? fingerprint.words
        : fingerprint.literals
      ).push([value, weight]);
    }
    return fingerprint;
  });
  return fingerprints;
}

/** Position in all.js order, so ties break the way HighlightAuto's do. */
function orderOf(/** @type {string} */ name) {
  indexOrder ??= new Map(DETECT_INDEX.map(([entry], i) => [entry, i]));
  return indexOrder.get(name) ?? Number.POSITIVE_INFINITY;
}

/**
 * @param {string} code
 * @returns {{ name: string, score: number }[]} Grammars that matched at
 *   least one feature, best first.
 */
function rank(code) {
  const sample =
    code.length > SAMPLE_LIMIT ? code.slice(0, SAMPLE_LIMIT) : code;
  const lower = sample.toLowerCase();
  const words = new Set(sample.match(WORD_RE));
  const lowerWords = new Set(lower.match(WORD_RE));

  /** @type {{ name: string, score: number, fraction: number }[]} */
  const scored = [];
  for (const fingerprint of getFingerprints()) {
    const text = fingerprint.caseInsensitive ? lower : sample;
    const wordSet = fingerprint.caseInsensitive ? lowerWords : words;
    let matched = 0;
    for (const [value, weight] of fingerprint.words) {
      if (wordSet.has(value)) matched += weight;
    }
    for (const [value, weight] of fingerprint.literals) {
      if (text.includes(value)) matched += weight;
    }
    if (matched === 0) continue;
    scored.push({
      name: fingerprint.name,
      // A grammar with a long fingerprint matches more by chance, so
      // divide by the square root of its total weight.
      score: matched / Math.sqrt(fingerprint.total),
      fraction: matched / fingerprint.total,
    });
  }
  // Higher score first. On a tie, the grammar whose own features matched
  // more fully wins.
  scored.sort((a, b) => b.score - a.score || b.fraction - a.fraction);
  return scored;
}

/**
 * @param {string} code
 * @param {number} [k]
 * @returns {string[]}
 */
export function detectCandidates(code, k = DEFAULT_CANDIDATES) {
  return rank(String(code ?? ""))
    .slice(0, k)
    .map(({ name }) => name);
}

/**
 * Names to load: the candidates plus every grammar they embed.
 * @param {string[]} names
 */
function withSubLanguages(names) {
  const all = new Set(names);
  for (const name of all) {
    for (const sub of SUB_LANGUAGES[name] ?? []) all.add(sub);
  }
  return [...all];
}

/**
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {{ k?: number, languageNames?: string[], registry?: Registry }} LazyOptions
 */

/**
 * @param {string} source
 * @param {LazyOptions} options
 */
function plan(source, options) {
  const {
    k = DEFAULT_CANDIDATES,
    languageNames,
    registry = sharedRegistry,
  } = options;
  const candidates = languageNames ?? detectCandidates(source, k);
  const missing = withSubLanguages(candidates).filter(
    (name) => !registry.get(name),
  );
  return { candidates, missing, registry, languageNames };
}

/** @param {ReturnType<typeof plan>} p @param {string} source */
function run({ candidates, registry, languageNames }, source) {
  if (languageNames) return registry.highlightAuto(source, languageNames);
  const registered = registry.listLanguages();
  const pool = [...new Set([...candidates, ...registered])].sort(
    (a, b) => orderOf(a) - orderOf(b),
  );
  return registry.highlightAuto(source, pool);
}

/**
 * Detects and highlights `code` without loading anything. Returns
 * `undefined` when a grammar it would load is not registered yet.
 * @param {any} code
 * @param {LazyOptions} [options]
 */
export function highlightAutoIfLoaded(code, options = {}) {
  const source = String(code ?? "");
  const p = plan(source, options);
  return p.missing.length > 0 ? undefined : run(p, source);
}

/**
 * Imports one grammar through the literal loader map. `loadLanguage` uses
 * a template-literal `import()`, which Vite does not rewrite inside
 * node_modules, so it can't serve the published package here.
 *
 * @param {string} name
 * @returns {Promise<import("./languages").LanguageType<string>>}
 */
async function loadGrammar(name) {
  const load = Object.hasOwn(LOADERS, name) ? LOADERS[name] : undefined;
  if (!load) throw new LanguageLoadError(name);
  try {
    return (await load()).default;
  } catch (cause) {
    throw new LanguageLoadError(name, { cause });
  }
}

/**
 * Loads the candidate grammars, registers them, then detects and
 * highlights `code`. A grammar that fails to load drops out of the pool.
 * @param {any} code
 * @param {LazyOptions} [options]
 */
export async function highlightAutoLazy(code, options = {}) {
  const source = String(code ?? "");
  const p = plan(source, options);
  const loaded = await Promise.allSettled(
    p.missing.map((name) => loadGrammar(name)),
  );
  for (const result of loaded) {
    if (result.status === "fulfilled") registerAll(p.registry, result.value);
  }
  return run(p, source);
}
