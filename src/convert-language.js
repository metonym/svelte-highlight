/**
 * hljs grammar to engine IR. Build time: scripts/convert-grammars.ts.
 * Runtime: svelte-highlight/compat's fromHighlightJs for user grammars.
 *
 * Force-compiles a grammar on an hljs instance and walks the compiled mode
 * tree into plain JSON. hljs already normalizes sugar (match/beginKeywords/
 * variants, etc.) and builds the mode graph. Callbacks recognized by
 * fingerprint become declarative IR flags; the rest become warnings.
 *
 * Output is regex sources, keyword tables, scope names, and flags. No hljs
 * code is copied into this file.
 */

/**
 * @typedef {import("./engine.d.ts").GrammarIR} GrammarIR
 * @typedef {import("./engine.d.ts").GrammarState} GrammarState
 */

/** @param {RegExp | string | null | undefined} re */
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;
  return re.source;
}

const FLAGS = /** @type {const} */ ([
  "endsWithParent",
  "endsParent",
  "skip",
  "excludeBegin",
  "excludeEnd",
  "returnBegin",
  "returnEnd",
]);

/**
 * @typedef {{ ir: GrammarIR, warnings: string[] }} ConvertResult
 */

/**
 * @param {unknown} hljs instance with the grammar (and any sublanguages it
 *   embeds) already registered
 * @param {string} name
 * @returns {ConvertResult}
 */
export function convertLanguage(hljs, name) {
  // hljs's compiled mode type is not exported; read fields loosely.
  const hl = /** @type {any} */ (hljs);
  // Force compilation; the registered object is the compiled tree.
  hl.highlight("", { language: name });
  const language = hl.getLanguage(name);
  if (!language) throw new Error(`Language not registered: "${name}"`);

  const warnings = new Set();
  const stateIndex = new Map();
  /** @type {GrammarState[]} */
  const states = [];

  /** @param {string | null | undefined} scope */
  const aliasScope = (scope) =>
    (scope && language.classNameAliases?.[scope]) || scope;

  /** @param {any} compiledScope */
  const convertCaptures = (compiledScope) => {
    /** @type {Record<string, string | null>} */
    const out = {};
    for (const key of Object.keys(compiledScope._emit)) {
      out[key] = compiledScope[key] ? aliasScope(compiledScope[key]) : null;
    }
    return out;
  };

  /**
   * @param {any} mode
   * @param {GrammarState} state
   */
  const recognizeCallbacks = (mode, state) => {
    const onBegin = mode["on:begin"] ? mode["on:begin"].toString() : "";
    const beforeBegin = mode.__beforeBegin ? mode.__beforeBegin.toString() : "";
    const onEnd = mode["on:end"] ? mode["on:end"].toString() : "";

    if (onBegin) {
      if (onBegin.includes("_beginMatch = m[1]")) {
        state.endSameAsBegin = true; // hljs END_SAME_AS_BEGIN (heredocs)
      } else if (onBegin.includes(".index !== 0")) {
        state.onlyAtInputStart = true; // hljs SHEBANG guard
      } else if (onBegin.includes("hasClosingTag(")) {
        // JSX opening tag vs generic/comparison. See Tokenizer#isTrulyOpeningTag.
        state.xmlTagGuard = true;
      } else {
        warnings.add(
          `on:begin not convertible (scope: ${mode.scope ?? "<none>"}, begin: ${source(mode.begin)})`,
        );
        // Dropped guard callback: state now matches unconditionally.
        // Zero relevance so auto-detection is not skewed.
        state.relevance = 0;
      }
    }
    if (beforeBegin) {
      if (beforeBegin.includes('"."')) {
        state.notAfterDot = true; // hljs beginKeywords dot-guard
      } else {
        warnings.add(
          `__beforeBegin not convertible: ${beforeBegin.slice(0, 60)}`,
        );
        state.relevance = 0;
      }
    }
    if (onEnd && !onEnd.includes("_beginMatch !== m[1]")) {
      warnings.add(
        `on:end not convertible (scope: ${mode.scope ?? "<none>"}, end: ${source(mode.end)})`,
      );
      state.relevance = 0;
    }
  };

  /**
   * @param {any} mode
   * @returns {number}
   */
  function visit(mode) {
    const seen = stateIndex.get(mode);
    if (seen !== undefined) return seen;
    const idx = states.length;
    stateIndex.set(mode, idx);
    states.push(/** @type {GrammarState} */ (/** @type {unknown} */ (null))); // reserve slot; contains may cycle back here

    /** @type {GrammarState} */
    const state = { relevance: mode.relevance ?? 1, rules: [] };
    if (typeof mode.scope === "string") state.scope = aliasScope(mode.scope);
    if (mode.begin != null && mode !== language) {
      const begin = source(mode.begin);
      if (begin != null) state.begin = begin;
    }
    if (mode.end != null) {
      const end = source(mode.end);
      if (end != null) state.end = end;
    }
    for (const flag of FLAGS) {
      if (mode[flag]) state[flag] = true;
    }
    if (mode.subLanguage != null) state.subLanguage = mode.subLanguage;
    if (mode.illegal) {
      const illegal = source(mode.illegal);
      if (illegal != null) state.illegal = illegal;
    }

    if (mode.keywords && typeof mode.keywords === "object") {
      state.keywords = {};
      for (const word of Object.keys(mode.keywords)) {
        const [kind, relevance] = mode.keywords[word];
        state.keywords[word] = [
          /** @type {string} */ (aliasScope(kind)),
          relevance,
        ];
      }
      if (mode.keywordPatternRe) {
        state.keywordPattern = mode.keywordPatternRe.source;
      }
    }

    if (mode.beginScope) {
      if (mode.beginScope._wrap) {
        state.wrapScope = /** @type {string} */ (
          aliasScope(mode.beginScope._wrap)
        );
      } else if (mode.beginScope._multi) {
        state.captureScopes = convertCaptures(mode.beginScope);
      }
    }
    if (mode.endScope) {
      if (mode.endScope._wrap) {
        state.endWrapScope = /** @type {string} */ (
          aliasScope(mode.endScope._wrap)
        );
      } else if (mode.endScope._multi) {
        state.endCaptureScopes = convertCaptures(mode.endScope);
      }
    }

    recognizeCallbacks(mode, state);

    state.rules = (mode.contains || []).map(visit);
    if (mode.starts) state.starts = visit(mode.starts);

    states[idx] = state;
    return idx;
  }

  visit(language);

  /** @type {GrammarIR} */
  const ir = {
    name: name.toLowerCase(),
    caseInsensitive: !!language.case_insensitive,
    unicode: !!language.unicodeRegex,
    disableAutodetect: !!language.disableAutodetect,
    states,
  };
  if (language.aliases) ir.aliases = [...language.aliases];
  if (language.supersetOf) ir.supersetOf = language.supersetOf;
  return { ir, warnings: [...warnings] };
}
