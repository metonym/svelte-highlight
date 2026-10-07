/**
 * Highlighting engine (MIT, no highlight.js code). Runs a serializable
 * grammar IR built from hljs grammars and emits a flat scope-event stream.
 * Renderers assume the stream is balanced (OPEN/CLOSE properly nested) and
 * that its TEXT values concatenate to the source. Scope names are raw hljs
 * names ("title.class_"); `renderHtml` adds the `hljs-` prefix.
 */

/**
 * @typedef {import("./engine.d.ts").GrammarIR} GrammarIR
 * @typedef {import("./engine.d.ts").GrammarState} GrammarState
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").TokenRange} TokenRange
 * @typedef {import("./engine.d.ts").LineToken} LineToken
 * @typedef {import("./engine.d.ts").HighlightResult} HighlightResult
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 * @typedef {import("./incremental-tokenize.js").IncrementalParse} IncrementalParse
 */

import {
  parseIncremental,
  reparseIncremental,
} from "./incremental-tokenize.js";

/**
 * @typedef {{ name: string, register: GrammarIR, dependencies?: Language[] }} Language
 */

/**
 * A grammar state with IR defaults filled in and patterns compiled.
 * @typedef {Omit<GrammarState, "rules" | "keywords" | "relevance" | "beginWordSet"> & {
 *   rules: number[],
 *   relevance: number,
 *   keywords: Record<string, [string, number]> | null,
 *   beginRe: RegExp | null,
 *   endRe: RegExp | null,
 *   illegalRe: RegExp | null,
 *   keywordRe: RegExp | null,
 *   beginWordSet: Set<string> | null,
 * }} CompiledState
 */

/**
 * @typedef {{ ir: GrammarIR, states: CompiledState[] }} Program
 */

/**
 * Memoized pattern scan: `match` is the earliest guard-passing match at or
 * after the `pos` it was computed at, or null if none in the first `codeLen`
 * chars. Windowed scans also set `until` (a miss only rules out starts before
 * it; Infinity once the scan reached the end) and `level` (window size).
 * @typedef {{
 *   codeLen: number,
 *   match: RegExpExecArray | null,
 *   until?: number,
 *   level?: number,
 * }} MatchCache
 */

/** @typedef {Required<MatchCache>} WindowCache */

/**
 * `endCache` is per-frame, not per-state: `endSameAsBegin`'s guard depends on
 * the frame's own `beginMatch`, and recursive frames can share a state.
 * @typedef {{ idx: number, state: CompiledState, beginMatch: string | undefined, beginPos: number, endCache?: MatchCache }} Frame
 */

/** @typedef {{ idx: number, beginMatch: string | undefined, beginPos: number }} FrameSnapshot */

/** @typedef {{ beginPos: number, frames: FrameSnapshot[] }} SubContinuation */

/**
 * The part of the registry `Tokenizer` uses (embedded-language lookups).
 * @typedef {{
 *   get(name: string): Program | undefined,
 *   tokenizeAuto(code: string, subset?: string[] | null): {
 *     language: string | undefined,
 *     relevance: number,
 *     events: ScopeEvent[],
 *     secondBest?: { language: string | undefined, relevance: number },
 *   },
 * }} EngineRegistry
 */

/**
 * `matchData` is the state index for "begin", the frame depth for "end",
 * and null for "illegal".
 * @typedef {"begin" | "end" | "illegal"} MatchKind
 */

const MAX_KEYWORD_HITS = 7;

/**
 * Auto-detection scores only this many leading chars (relevance saturates
 * early); the winner is re-tokenized over the full code.
 */
const DETECT_SAMPLE_LIMIT = 8000;

/**
 * Windowed scans cover `WINDOW_BASE << level` start positions; past the last
 * level they run to the end. Kept small: a window scan is slower per char
 * than a plain `exec`.
 */
const WINDOW_BASE = 256;
const WINDOW_LEVELS = 5;

/** @type {WeakMap<RegExp, RegExp[]>} */
const windowRegExps = new WeakMap();

/**
 * Sticky regex matching the shortest prefix (< window size) after which `re`
 * matches. The lookahead sees the whole code, so anchors and lookarounds
 * behave as in `re`; the prefix is non-capturing, so group numbers hold.
 * @param {RegExp} re
 * @param {number} level
 * @returns {RegExp}
 */
function windowRegExp(re, level) {
  let byLevel = windowRegExps.get(re);
  if (byLevel === undefined) {
    byLevel = [];
    windowRegExps.set(re, byLevel);
  }
  let windowRe = byLevel[level];
  if (windowRe === undefined) {
    const span = (WINDOW_BASE << level) - 1;
    windowRe = new RegExp(
      `[\\s\\S]{0,${span}}?(?=(?:${re.source}))`,
      `${re.flags.replace("g", "")}y`,
    );
    byLevel[level] = windowRe;
  }
  return windowRe;
}

const XML_TAG_DEFAULT_PARAM_RE = /^\s*=/;
const XML_TAG_EXTENDS_CONSTRAINT_RE = /^\s+extends\s+/;

/** Event kinds. Events are {t: TEXT, v} | {t: OPEN, s} | {t: CLOSE}. */
export const TEXT = 0;
export const OPEN = 1;
export const CLOSE = 2;

export class UnknownLanguageError extends Error {
  /**
   * @param {string} language
   */
  constructor(language) {
    super(`Unknown language: "${language}"`);
    this.name = "UnknownLanguageError";
    this.language = language;
  }
}

export class TokenizerLoopError extends Error {
  /**
   * @param {string} grammarName
   * @param {number} iterations
   */
  constructor(grammarName, iterations) {
    super(`potential infinite loop (${grammarName})`);
    this.name = "TokenizerLoopError";
    this.grammarName = grammarName;
    this.iterations = iterations;
  }
}

const LANGUAGE_SCOPE_PREFIX = "language:";

/**
 * Hot path (every TEXT event): a char-code scan beats a regex on short
 * strings, and the common no-escape case returns `value` as-is.
 * @param {string} value
 */
export function escapeHtml(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    // `>` (62) is the highest code point that needs escaping.
    if (code <= 62 && htmlEscape(code) !== null)
      return escapeHtmlFrom(value, i);
  }
  return value;
}

/**
 * @param {number} code
 * @returns {string | null}
 */
function htmlEscape(code) {
  switch (code) {
    case 38:
      return "&amp;";
    case 60:
      return "&lt;";
    case 62:
      return "&gt;";
    case 34:
      return "&quot;";
    case 39:
      return "&#x27;";
    default:
      return null;
  }
}

/**
 * @param {string} value
 * @param {number} start
 */
function escapeHtmlFrom(value, start) {
  let out = value.slice(0, start);
  let last = start;
  for (let i = start; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 62) continue;
    const entity = htmlEscape(code);
    if (entity === null) continue;
    out += value.slice(last, i) + entity;
    last = i + 1;
  }
  return out + value.slice(last);
}

/** @type {number[]} */
const EMPTY_RULES = [];

/**
 * Expands `[scope, relevance, "word word ..."]` groups into a word map.
 * @param {Array<[string, number, string]>} groups
 */
function expandKeywordTable(groups) {
  /** @type {Record<string, [string, number]>} */
  const table = Object.create(null);
  for (const [scope, relevance, words] of groups) {
    const data = /** @type {[string, number]} */ ([scope, relevance]);
    for (const word of words.split(" ")) table[word] = data;
  }
  return table;
}

/**
 * @param {GrammarIR} ir
 * @returns {Program}
 */
function compileProgram(ir) {
  const flags = `mg${ir.caseInsensitive ? "i" : ""}${ir.unicode ? "u" : ""}`;
  /** @param {string | undefined} src */
  const re = (src) => (src == null ? null : new RegExp(src, flags));
  const tables = (ir.keywordTables || []).map(expandKeywordTable);
  const states = ir.states.map((s) => ({
    ...s,
    rules: s.rules || EMPTY_RULES,
    relevance: s.relevance ?? 1,
    keywords:
      typeof s.keywords === "number"
        ? /** @type {Record<string, [string, number]>} */ (tables[s.keywords])
        : s.keywords
          ? Object.assign(Object.create(null), s.keywords)
          : null,
    beginRe: re(s.begin),
    endRe: re(s.end),
    illegalRe: re(s.illegal),
    keywordRe: s.keywords == null ? null : re(s.keywordPattern || "\\w+"),
    beginWordSet: s.beginWordSet ? new Set(s.beginWordSet) : null,
  }));
  return { ir, states };
}

class Tokenizer {
  /**
   * @param {EngineRegistry} registry
   * @param {Program} program
   * @param {{ detect?: boolean }} [options] `detect` aborts on `illegal`.
   */
  constructor(registry, program, { detect = false } = {}) {
    this.registry = registry;
    this.program = program;
    this.detect = detect;
    this.code = "";
    this.pos = 0;
    this.buffer = "";
    this.relevance = 0;
    /** @type {ScopeEvent[]} */
    this.events = [];
    this.openScopes = 0;
    /** @type {Record<string, number>} */
    this.kwHits = Object.create(null);
    /** Copy-on-write: `kwHits` is shared with a snapshot until the next hit. */
    this.kwHitsShared = false;
    /** @type {Frame[]} */
    this.frames = [
      {
        idx: 0,
        state: /** @type {CompiledState} */ (program.states[0]),
        beginMatch: undefined,
        beginPos: 0,
      },
    ];
    this.aborted = false;
    this.iterations = 0;
    /**
     * Bound begin/end scans to a window past the cursor, so a reparse after
     * an edit (which usually stops soon) doesn't scan the whole tail. Never
     * set in detect mode, so the windowed path ignores `illegal`.
     */
    this.windowed = false;
    /**
     * Embedded-language parse state by name, only resumed by the same
     * embedding occurrence (same `beginPos`), so e.g. a second fenced block
     * doesn't inherit the first's open-tag state.
     * @type {Record<string, SubContinuation>}
     */
    this.subContinuations = Object.create(null);
    /**
     * Begin-pattern scans by state index; shared across parents.
     * @type {(MatchCache | undefined)[]}
     */
    this.beginCache = [];
    /**
     * `illegal` scans by state index (detect mode). Uncached, a pattern with
     * no match left rescanned the whole sample per lexeme.
     * @type {(MatchCache | undefined)[]}
     */
    this.illegalCache = [];
    /** @type {Map<string, number>} */
    this.noClosingTag = new Map();
    this.noClosingTagCodeLen = 0;
    /** @type {MatchKind} */
    this.matchKind = "begin";
    /** @type {number | null} */
    this.matchData = null;
  }

  /** @returns {Frame} */
  get top() {
    return /** @type {Frame} */ (this.frames[this.frames.length - 1]);
  }

  /** @param {string} value */
  text(value) {
    if (value !== "") this.events.push({ t: TEXT, v: value });
  }

  /** @param {string} scope */
  open(scope) {
    this.events.push({ t: OPEN, s: scope });
    this.openScopes++;
  }

  close() {
    this.events.push({ t: CLOSE });
    this.openScopes--;
  }

  /**
   * @param {string} value
   * @param {string} scope
   */
  emitKeyword(value, scope) {
    if (!value) return;
    this.open(scope);
    this.text(value);
    this.close();
  }

  /**
   * @param {Record<string, string | null>} captureScopes
   * @param {RegExpExecArray} match
   */
  emitCaptures(captureScopes, match) {
    for (const key of Object.keys(captureScopes)) {
      const value = match[+key];
      if (value === undefined) continue;
      const scope = captureScopes[key];
      if (scope) this.emitKeyword(value, scope);
      else this.keywordProcess(value, this.top.state);
    }
  }

  flush() {
    const state = this.top.state;
    if (state.subLanguage == null) this.keywordProcess(this.buffer, state);
    else this.flushSubLanguage(state);
    this.buffer = "";
  }

  /**
   * Splits `text` into keyword and plain-text events, slicing plain runs out
   * of `text`. Any keyword hit ends the current TEXT event, even a
   * relevance-only (`_`) one, which stays in the next plain run.
   * @param {string} text
   * @param {CompiledState} state
   */
  keywordProcess(text, state) {
    if (!state.keywords) {
      this.text(text);
      return;
    }
    if (text === "") return;
    const keywords = state.keywords;
    const keywordRe = /** @type {RegExp} */ (state.keywordRe);
    const caseInsensitive = this.program.ir.caseInsensitive;
    let kwHits = this.kwHits;
    let textStart = 0;
    keywordRe.lastIndex = 0;
    let match = keywordRe.exec(text);
    while (match) {
      const lexeme = match[0];
      const word = caseInsensitive ? lexeme.toLowerCase() : lexeme;
      const data = keywords[word];
      if (data) {
        const [kind, keywordRelevance] = data;
        this.text(text.substring(textStart, match.index));
        if (this.kwHitsShared) {
          // Null-prototype copy: a restored plain-object snapshot must not
          // leak `constructor` etc.
          kwHits = Object.assign(Object.create(null), kwHits);
          this.kwHits = kwHits;
          this.kwHitsShared = false;
        }
        const hits = (kwHits[word] || 0) + 1;
        kwHits[word] = hits;
        if (hits <= MAX_KEYWORD_HITS) this.relevance += keywordRelevance;
        if (kind.charCodeAt(0) === 95) {
          // "_": relevance-only, not highlighted
          textStart = match.index;
        } else {
          this.emitKeyword(lexeme, kind);
          textStart = keywordRe.lastIndex;
        }
      }
      match = keywordRe.exec(text);
    }
    this.text(textStart === 0 ? text : text.substring(textStart));
  }

  /** @param {CompiledState} state */
  flushSubLanguage(state) {
    const text = this.buffer;
    if (text === "") return;
    const subLanguage = /** @type {string | string[]} */ (state.subLanguage);
    /** @type {{ language: string | undefined, relevance: number, events: ScopeEvent[] }} */
    let result;
    if (typeof subLanguage === "string") {
      const program = this.registry.get(subLanguage);
      if (!program) {
        this.text(text);
        return;
      }
      // Resume only a continuation from this same embedding occurrence.
      const beginPos = this.top.beginPos;
      const sub = new Tokenizer(this.registry, program);
      sub.code = text;
      const record = this.subContinuations[subLanguage];
      const carried = record?.beginPos === beginPos ? record.frames : undefined;
      if (carried) {
        sub.frames = carried.map((f) => ({
          idx: f.idx,
          state: /** @type {CompiledState} */ (program.states[f.idx]),
          beginMatch: f.beginMatch,
          beginPos: f.beginPos,
        }));
        for (const frame of sub.frames) {
          if (frame.idx !== 0 && frame.state.scope) sub.open(frame.state.scope);
        }
      }
      sub.run();
      const finished = sub.finish();
      this.subContinuations[subLanguage] = {
        beginPos,
        frames: sub.frames.map((f) => ({
          idx: f.idx,
          beginMatch: f.beginMatch,
          beginPos: f.beginPos,
        })),
      };
      result = {
        language: subLanguage,
        relevance: finished.relevance,
        events: finished.events,
      };
    } else {
      result = this.registry.tokenizeAuto(
        text,
        subLanguage.length ? subLanguage : null,
      );
    }
    if (state.relevance > 0) this.relevance += result.relevance;
    if (result.language) {
      this.open(`${LANGUAGE_SCOPE_PREFIX}${result.language}`);
      for (const event of result.events) this.events.push(event);
      this.close();
    } else {
      for (const event of result.events) this.events.push(event);
    }
  }

  /**
   * Earliest match of `re` at or after `from` that passes `guard`.
   * @param {RegExp} re
   * @param {number} from
   * @param {((m: RegExpExecArray) => boolean) | null} guard
   * @returns {RegExpExecArray | null}
   */
  execValid(re, from, guard) {
    re.lastIndex = from;
    let match = re.exec(this.code);
    while (match) {
      if (!guard || guard(match)) return match;
      if (match.index >= this.code.length) return null;
      re.lastIndex = match.index + 1;
      match = re.exec(this.code);
    }
    return null;
  }

  /**
   * A cached match is valid until `pos` passes it; a cached miss until the
   * code grows. Plain boolean (not a type predicate) so a stale cache isn't
   * narrowed to `undefined` where `nextMatch` refreshes it in place.
   * @param {MatchCache | undefined} cache
   * @returns {boolean}
   */
  isCacheValid(cache) {
    if (!cache) return false;
    if (cache.match !== null && cache.match.index >= this.pos) return true;
    return cache.match === null && cache.codeLen === this.code.length;
  }

  /**
   * @param {CompiledState} state
   * @returns {((m: RegExpExecArray) => boolean) | null}
   */
  beginGuard(state) {
    if (state.onlyAtInputStart) {
      return (m) => m.index === 0;
    }
    if (state.notAfterDot) {
      return (m) => this.code[m.index - 1] !== ".";
    }
    if (state.xmlTagGuard) {
      return (m) => this.isTrulyOpeningTag(m);
    }
    if (state.letterBoundaryGuard) {
      return (m) => {
        if (m.index === 0) return true;
        const charBeforeMatch = this.code[m.index - 1] ?? "";
        return (
          (charBeforeMatch >= "0" && charBeforeMatch <= "9") ||
          charBeforeMatch === "_"
        );
      };
    }
    if (state.beginWordSet) {
      const wordSet = state.beginWordSet;
      return (m) => wordSet.has(m[0]);
    }
    return null;
  }

  /**
   * Whether `</name` occurs at or after `from`. Misses are memoized per name
   * (absence from `from` implies absence later), avoiding quadratic rescans
   * in generic-heavy code; reset when `code` grows.
   * @param {string} name
   * @param {number} from
   * @returns {boolean}
   */
  hasClosingTag(name, from) {
    if (this.noClosingTagCodeLen !== this.code.length) {
      this.noClosingTag.clear();
      this.noClosingTagCodeLen = this.code.length;
    }
    const absentFrom = this.noClosingTag.get(name);
    if (absentFrom !== undefined && from >= absentFrom) return false;
    if (this.code.indexOf(`</${name}`, from) !== -1) return true;
    this.noClosingTag.set(name, from);
    return false;
  }

  /**
   * JSX-vs-generic disambiguation for a `<Foo` match (hljs javascript).
   * @param {RegExpExecArray} match
   * @returns {boolean}
   */
  isTrulyOpeningTag(match) {
    const afterIdx = match.index + match[0].length;
    const nextChar = this.code[afterIdx];
    // `Array<Array<number>>`, `<T, A extends keyof T, V>`
    if (nextChar === "<" || nextChar === ",") return false;
    // `<something>` - only a tag if a matching closing tag exists later on.
    if (nextChar === ">" && !this.hasClosingTag(match[0].slice(1), afterIdx)) {
      return false;
    }
    const after = this.code.slice(afterIdx);
    // `<T = any>(key?: string) => Modify<`
    if (XML_TAG_DEFAULT_PARAM_RE.test(after)) return false;
    // `<From extends string>`
    if (XML_TAG_EXTENDS_CONSTRAINT_RE.test(after)) return false;
    return true;
  }

  /**
   * The next lexeme: earliest match wins; ties go to begin rules in order,
   * then ends innermost-first, then illegal. Sets `matchKind`/`matchData`.
   * Hot path: allocates nothing on cache hits (no closures or result
   * objects; stale caches are refreshed in place).
   * @returns {RegExpExecArray | null}
   */
  nextMatch() {
    /** @type {RegExpExecArray | null} */
    let best = null;
    let bestIndex = Number.POSITIVE_INFINITY;
    /** @type {MatchKind} */
    let bestKind = "begin";
    /** @type {number | null} */
    let bestData = null;

    const state = this.top.state;
    const rules = state.rules;
    const states = this.program.states;
    // Strict `<` keeps the earliest rule on ties.
    for (let i = 0; i < rules.length; i++) {
      const ruleIdx = /** @type {number} */ (rules[i]);
      let cache = this.beginCache[ruleIdx];
      // Guard closures are only built on a cache miss.
      if (!this.isCacheValid(cache)) {
        const child = /** @type {CompiledState} */ (states[ruleIdx]);
        const match = this.execValid(
          /** @type {RegExp} */ (child.beginRe),
          this.pos,
          this.beginGuard(child),
        );
        if (cache) {
          cache.codeLen = this.code.length;
          cache.match = match;
        } else {
          cache = { codeLen: this.code.length, match };
          this.beginCache[ruleIdx] = cache;
        }
      }
      const match = /** @type {MatchCache} */ (cache).match;
      if (match !== null && match.index < bestIndex) {
        best = match;
        bestIndex = match.index;
        bestData = ruleIdx;
      }
    }
    // Ends walk outward while `endsWithParent` allows; they rank below
    // begins, innermost-first, so they too need a strictly earlier index.
    for (let d = this.frames.length - 1; d >= 1; d--) {
      const frame = /** @type {Frame} */ (this.frames[d]);
      const endRe = frame.state.endRe;
      if (endRe) {
        let cache = frame.endCache;
        if (!this.isCacheValid(cache)) {
          const match = this.execValid(endRe, this.pos, this.endGuard(frame));
          if (cache) {
            cache.codeLen = this.code.length;
            cache.match = match;
          } else {
            cache = { codeLen: this.code.length, match };
            frame.endCache = cache;
          }
        }
        const match = /** @type {MatchCache} */ (cache).match;
        if (match !== null && match.index < bestIndex) {
          best = match;
          bestIndex = match.index;
          bestKind = "end";
          bestData = d;
        }
      }
      if (!frame.state.endsWithParent) break;
    }
    if (this.detect && state.illegalRe) {
      const stateIdx = this.top.idx;
      let cache = this.illegalCache[stateIdx];
      if (!this.isCacheValid(cache)) {
        const match = this.execValid(state.illegalRe, this.pos, null);
        if (cache) {
          cache.codeLen = this.code.length;
          cache.match = match;
        } else {
          cache = { codeLen: this.code.length, match };
          this.illegalCache[stateIdx] = cache;
        }
      }
      const match = /** @type {MatchCache} */ (cache).match;
      if (match !== null && match.index < bestIndex) {
        best = match;
        bestKind = "illegal";
        bestData = null;
      }
    }
    this.matchKind = bestKind;
    this.matchData = bestData;
    return best;
  }

  /**
   * @param {Frame} frame
   * @returns {((m: RegExpExecArray) => boolean) | null}
   */
  endGuard(frame) {
    return frame.state.endSameAsBegin ? (m) => m[1] === frame.beginMatch : null;
  }

  /**
   * @param {WindowCache} cache
   * @returns {boolean}
   */
  isWindowValid(cache) {
    if (cache.match !== null) return cache.match.index >= this.pos;
    return cache.codeLen === this.code.length && cache.until > this.pos;
  }

  /**
   * `execValid` over a window of `WINDOW_BASE << cache.level` start positions
   * from `from`, written into `cache` (a miss sets `until` to the window
   * end). Matches come from `re.exec`, identical to an unwindowed scan's.
   * @param {WindowCache} cache
   * @param {RegExp} re
   * @param {number} from
   * @param {((m: RegExpExecArray) => boolean) | null} guard
   */
  scanWindowed(cache, re, from, guard) {
    const code = this.code;
    cache.codeLen = code.length;
    cache.until = Number.POSITIVE_INFINITY;
    const size = WINDOW_BASE << cache.level;
    // Scan plainly when a window would reach the end anyway (plain `exec`
    // is faster), or under `u`, where a window could start mid-surrogate.
    if (
      cache.level >= WINDOW_LEVELS ||
      from + size > code.length ||
      re.unicode
    ) {
      cache.match = this.execValid(re, from, guard);
      return;
    }
    const windowRe = windowRegExp(re, cache.level);
    let start = from;
    for (;;) {
      windowRe.lastIndex = start;
      const found = windowRe.exec(code);
      if (found === null) {
        cache.match = null;
        // The window covered every start up to `code.length` inclusive.
        if (start + size <= code.length) cache.until = start + size;
        return;
      }
      const at = start + found[0].length;
      re.lastIndex = at;
      const match = re.exec(code);
      if (match === null || match.index !== at) {
        // Unreachable; guards against a regex engine quirk changing output.
        cache.match = this.execValid(re, from, guard);
        return;
      }
      if (!guard || guard(match)) {
        cache.match = match;
        return;
      }
      if (at >= code.length) {
        cache.match = null;
        return;
      }
      start = at + 1;
    }
  }

  /**
   * `nextMatch` for a windowed tokenizer. A miss's window is widened (from
   * `until`) while the rule could still beat the best match. Windows never
   * widen past `stopAt`, so a returned match at or past `stopAt` may not be
   * the earliest (`run` stops there anyway).
   * @param {number} stopAt
   * @returns {RegExpExecArray | null}
   */
  nextMatchWindowed(stopAt) {
    const rules = this.top.state.rules;
    const states = this.program.states;
    const frames = this.frames;
    const beginCache = /** @type {(WindowCache | undefined)[]} */ (
      this.beginCache
    );
    for (;;) {
      /** @type {RegExpExecArray | null} */
      let best = null;
      let bestIndex = Number.POSITIVE_INFINITY;
      /** @type {MatchKind} */
      let bestKind = "begin";
      /** @type {number | null} */
      let bestData = null;
      let minUntil = Number.POSITIVE_INFINITY;
      for (let i = 0; i < rules.length; i++) {
        const ruleIdx = /** @type {number} */ (rules[i]);
        let cache = beginCache[ruleIdx];
        if (cache === undefined) {
          cache = { codeLen: -1, match: null, until: 0, level: 0 };
          beginCache[ruleIdx] = cache;
        }
        if (!this.isWindowValid(cache)) {
          // `pos` passed a miss's window: widen the next one.
          if (cache.match === null && cache.codeLen === this.code.length) {
            cache.level++;
          }
          const child = /** @type {CompiledState} */ (states[ruleIdx]);
          this.scanWindowed(
            cache,
            /** @type {RegExp} */ (child.beginRe),
            this.pos,
            this.beginGuard(child),
          );
        }
        const match = cache.match;
        if (match === null) {
          if (cache.until < minUntil) minUntil = cache.until;
        } else if (match.index < bestIndex) {
          best = match;
          bestIndex = match.index;
          bestData = ruleIdx;
        }
      }
      for (let d = frames.length - 1; d >= 1; d--) {
        const frame = /** @type {Frame} */ (frames[d]);
        const endRe = frame.state.endRe;
        if (endRe) {
          let cache = /** @type {WindowCache | undefined} */ (frame.endCache);
          if (cache === undefined) {
            cache = { codeLen: -1, match: null, until: 0, level: 0 };
            frame.endCache = cache;
          }
          if (!this.isWindowValid(cache)) {
            if (cache.match === null && cache.codeLen === this.code.length) {
              cache.level++;
            }
            this.scanWindowed(cache, endRe, this.pos, this.endGuard(frame));
          }
          const match = cache.match;
          if (match === null) {
            if (cache.until < minUntil) minUntil = cache.until;
          } else if (match.index < bestIndex) {
            best = match;
            bestIndex = match.index;
            bestKind = "end";
            bestData = d;
          }
        }
        if (!frame.state.endsWithParent) break;
      }
      // Done once no unresolved rule could start at or before `limit`.
      const limit = Math.min(bestIndex, stopAt - 1);
      if (minUntil > limit || minUntil === Number.POSITIVE_INFINITY) {
        this.matchKind = bestKind;
        this.matchData = bestData;
        return best;
      }
      for (let i = 0; i < rules.length; i++) {
        const ruleIdx = /** @type {number} */ (rules[i]);
        const cache = /** @type {WindowCache} */ (beginCache[ruleIdx]);
        if (cache.match !== null || cache.until > limit) continue;
        const child = /** @type {CompiledState} */ (states[ruleIdx]);
        cache.level++;
        this.scanWindowed(
          cache,
          /** @type {RegExp} */ (child.beginRe),
          cache.until,
          this.beginGuard(child),
        );
      }
      for (let d = frames.length - 1; d >= 1; d--) {
        const frame = /** @type {Frame} */ (frames[d]);
        const cache = /** @type {WindowCache | undefined} */ (frame.endCache);
        if (cache && cache.match === null && cache.until <= limit) {
          cache.level++;
          this.scanWindowed(
            cache,
            /** @type {RegExp} */ (frame.state.endRe),
            cache.until,
            this.endGuard(frame),
          );
        }
        if (!frame.state.endsWithParent) break;
      }
    }
  }

  /**
   * Shared by begin matches and `starts` chaining.
   * @param {number} idx
   * @param {CompiledState} state
   * @param {RegExpExecArray} match
   */
  enterState(idx, state, match) {
    if (state.scope) this.open(state.scope);
    if (state.wrapScope) {
      this.emitKeyword(this.buffer, state.wrapScope);
      this.buffer = "";
    } else if (state.captureScopes) {
      this.emitCaptures(state.captureScopes, match);
      this.buffer = "";
    }
    this.frames.push({
      idx,
      state,
      beginMatch: state.endSameAsBegin ? match[1] : undefined,
      beginPos: match.index,
    });
  }

  /**
   * @param {RegExpExecArray} match
   * @param {number} idx
   * @returns {number}
   */
  doBegin(match, idx) {
    const state = /** @type {CompiledState} */ (this.program.states[idx]);
    const lexeme = match[0];
    if (state.skip) {
      this.buffer += lexeme;
    } else {
      if (state.excludeBegin) this.buffer += lexeme;
      this.flush();
      if (!state.returnBegin && !state.excludeBegin) this.buffer = lexeme;
    }
    this.enterState(idx, state, match);
    return state.returnBegin ? 0 : lexeme.length;
  }

  /**
   * @param {RegExpExecArray} match
   * @param {number} depth
   * @returns {number}
   */
  doEnd(match, depth) {
    // `endsParent` extends the ended range outward through parents.
    let d = depth;
    while (d > 1 && /** @type {Frame} */ (this.frames[d]).state.endsParent) d--;

    const origin = this.top.state;
    const lexeme = match[0];
    if (origin.endWrapScope) {
      this.flush();
      this.emitKeyword(lexeme, origin.endWrapScope);
    } else if (origin.endCaptureScopes) {
      this.flush();
      this.emitCaptures(origin.endCaptureScopes, match);
    } else if (origin.skip) {
      this.buffer += lexeme;
    } else {
      if (!(origin.returnEnd || origin.excludeEnd)) this.buffer += lexeme;
      this.flush();
      if (origin.excludeEnd) this.buffer = lexeme;
    }

    /** @type {Frame} */
    let popped;
    do {
      popped = /** @type {Frame} */ (this.frames.pop());
      if (popped.state.scope) this.close();
      if (!popped.state.skip && popped.state.subLanguage == null) {
        this.relevance += popped.state.relevance;
      }
    } while (this.frames.length > d);

    if (popped.state.starts != null) {
      const startsIdx = popped.state.starts;
      this.enterState(
        startsIdx,
        /** @type {CompiledState} */ (this.program.states[startsIdx]),
        match,
      );
    }
    return origin.returnEnd ? 0 : lexeme.length;
  }

  /**
   * Consumes as much of `this.code` as possible; resumable after append.
   * `stopAt` halts before the first lexeme starting at or past it, so state
   * at a line boundary matches a streaming parse that hasn't seen later text.
   * @param {number} [stopAt]
   */
  run(stopAt = Number.POSITIVE_INFINITY) {
    if (this.aborted) return;
    for (;;) {
      this.iterations++;
      // Per-char term keeps huge inputs legal; a flat cap rejected big files.
      if (this.iterations > 500000 && this.iterations > this.pos * 3) {
        throw new TokenizerLoopError(this.program.ir.name, this.iterations);
      }
      const match = this.windowed
        ? this.nextMatchWindowed(stopAt)
        : this.nextMatch();
      if (!match) break;
      if (match.index >= stopAt) return;

      const framesBefore = this.frames.length;
      const topBefore = this.top;
      this.buffer += this.code.slice(this.pos, match.index);

      let consumed;
      const kind = this.matchKind;
      if (kind === "illegal") {
        this.aborted = true;
        return;
      } else if (kind === "begin") {
        consumed = this.doBegin(match, /** @type {number} */ (this.matchData));
      } else {
        consumed = this.doEnd(match, /** @type {number} */ (this.matchData));
      }

      let next = match.index + consumed;
      if (
        next === this.pos &&
        this.frames.length === framesBefore &&
        this.top === topBefore
      ) {
        // 0-width match made no progress: consume one char (as hljs does).
        this.buffer += this.code.slice(this.pos, this.pos + 1);
        next = this.pos + 1;
      }
      this.pos = next;
    }
  }

  /** @returns {{ relevance: number, events: ScopeEvent[], aborted: boolean }} */
  finish() {
    this.buffer += this.code.slice(this.pos);
    this.pos = this.code.length;
    this.flush();
    while (this.openScopes > 0) this.close();
    return {
      relevance: this.relevance,
      events: this.events,
      aborted: this.aborted,
    };
  }

  /**
   * Serializable parse state; everything needed to resume at `pos`.
   * @returns {Snapshot}
   */
  snapshot() {
    // `kwHits` is shared, not copied (see `kwHitsShared`).
    this.kwHitsShared = true;
    return {
      pos: this.pos,
      buffer: this.buffer,
      relevance: this.relevance,
      kwHits: this.kwHits,
      frames: this.frames.map((f) => ({
        idx: f.idx,
        beginMatch: f.beginMatch,
        beginPos: f.beginPos,
      })),
      openScopes: this.openScopes,
      eventCount: this.events.length,
      subContinuations: Object.fromEntries(
        Object.entries(this.subContinuations).map(([name, record]) => [
          name,
          {
            beginPos: record.beginPos,
            frames: record.frames.map((f) => ({
              idx: f.idx,
              beginMatch: f.beginMatch,
              beginPos: f.beginPos,
            })),
          },
        ]),
      ),
    };
  }

  /** @param {Snapshot} snap */
  restore(snap) {
    this.pos = snap.pos;
    this.buffer = snap.buffer;
    this.relevance = snap.relevance;
    this.kwHits = snap.kwHits;
    this.kwHitsShared = true;
    this.frames = snap.frames.map((f) => ({
      idx: f.idx,
      state: /** @type {CompiledState} */ (this.program.states[f.idx]),
      beginMatch: f.beginMatch,
      beginPos: f.beginPos,
    }));
    this.openScopes = snap.openScopes;
    this.events = [];
    this.subContinuations = Object.assign(
      Object.create(null),
      snap.subContinuations,
    );
  }
}

/**
 * @param {string} name
 * @param {string} prefix
 */
export function scopeToCssClass(name, prefix) {
  if (name.startsWith(LANGUAGE_SCOPE_PREFIX)) {
    return name.replace(LANGUAGE_SCOPE_PREFIX, "language-");
  }
  if (name.includes(".")) {
    const pieces = name.split(".");
    return [
      `${prefix}${pieces.shift()}`,
      ...pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`),
    ].join(" ");
  }
  return `${prefix}${name}`;
}

/**
 * Memoized `<span class="...">` tags by class prefix, then scope. Capped so
 * arbitrary class prefixes can't grow it without bound.
 * @type {Map<string, Map<string, string>>}
 */
const openTagCache = new Map();
const OPEN_TAG_LIMIT = 2048;
let openTagCount = 0;

/**
 * @param {string} prefix
 * @returns {Map<string, string>}
 */
function openTagsFor(prefix) {
  let tags = openTagCache.get(prefix);
  if (tags === undefined) {
    tags = new Map();
    openTagCache.set(prefix, tags);
  }
  return tags;
}

/**
 * @param {Map<string, string>} tags
 * @param {string} scope
 * @param {string} prefix
 * @returns {string}
 */
function openTag(tags, scope, prefix) {
  let tag = tags.get(scope);
  if (tag === undefined) {
    if (openTagCount >= OPEN_TAG_LIMIT) {
      for (const cached of openTagCache.values()) cached.clear();
      openTagCount = 0;
    }
    tag = `<span class="${scopeToCssClass(scope, prefix)}">`;
    tags.set(scope, tag);
    openTagCount++;
  }
  return tag;
}

/**
 * @param {ScopeEvent[]} events
 * @param {{ classPrefix?: string }} [options]
 * @returns {string} hljs-compatible HTML
 */
export function renderHtml(events, { classPrefix = "hljs-" } = {}) {
  const tags = openTagsFor(classPrefix);
  let out = "";
  for (const event of events) {
    if (event.t === TEXT) out += escapeHtml(event.v);
    else if (event.t === OPEN) out += openTag(tags, event.s, classPrefix);
    else out += "</span>";
  }
  return out;
}

/**
 * Extends line-rendered HTML with only `newEvents`, continuing from
 * `pendingHtml`/`openScopes`.
 * @param {ScopeEvent[]} newEvents
 * @param {string[]} openScopes
 * @param {string} pendingHtml
 * @param {{ classPrefix?: string }} [options]
 * @returns {{ completedLines: string[], pendingHtml: string, openScopes: string[] }}
 */
export function extendLines(
  newEvents,
  openScopes,
  pendingHtml,
  { classPrefix = "hljs-" } = {},
) {
  const stack = [...openScopes];
  /** @type {string[]} */
  const completedLines = [];
  const openTags = openTagsFor(classPrefix);
  // Reopen/close strings for the current stack, reused across line breaks.
  /** @type {string[]} */
  const tags = stack.map((scope) => openTag(openTags, scope, classPrefix));
  let reopen = tags.join("");
  let closeAll = "</span>".repeat(stack.length);
  let current = pendingHtml;
  for (const event of newEvents) {
    if (event.t === OPEN) {
      stack.push(event.s);
      const tag = openTag(openTags, event.s, classPrefix);
      tags.push(tag);
      reopen += tag;
      closeAll += "</span>";
      current += tag;
    } else if (event.t === CLOSE) {
      stack.pop();
      const tag = /** @type {string} */ (tags.pop());
      reopen = reopen.slice(0, reopen.length - tag.length);
      closeAll = closeAll.slice(0, closeAll.length - "</span>".length);
      current += "</span>";
    } else {
      const text = event.v;
      let start = 0;
      for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10) {
          current += escapeHtml(text.slice(start, i));
          current += closeAll;
          completedLines.push(current);
          current = reopen;
          start = i + 1;
        }
      }
      current += escapeHtml(text.slice(start));
    }
  }
  return { completedLines, pendingHtml: current, openScopes: stack };
}

/**
 * Flat ranges for the CSS Custom Highlight API: text gets its innermost
 * scope; sublanguage wrappers are transparent.
 * @param {ScopeEvent[]} events
 * @returns {TokenRange[]}
 */
export function toRanges(events) {
  /** @type {TokenRange[]} */
  const ranges = [];
  /** @type {Array<string | null>} */
  const stack = [];
  let pos = 0;
  for (const event of events) {
    if (event.t === OPEN) {
      stack.push(event.s.startsWith(LANGUAGE_SCOPE_PREFIX) ? null : event.s);
    } else if (event.t === CLOSE) {
      stack.pop();
    } else {
      const scope = stack[stack.length - 1];
      if (scope != null && event.v.length > 0) {
        ranges.push({ start: pos, end: pos + event.v.length, scope });
      }
      pos += event.v.length;
    }
  }
  return ranges;
}

/**
 * Splits only on LF to match `splitLines` on `renderHtml` output: a CR stays
 * at the end of its line, and a trailing newline (or empty input) yields a
 * trailing empty line.
 * @param {ScopeEvent[]} events
 * @returns {LineToken[][]}
 */
export function tokenLines(events) {
  /** @type {LineToken[][]} */
  const lines = [];
  /** @type {LineToken[]} */
  let line = [];
  /** @type {string[]} */
  const stack = [];
  // Recomputed only on OPEN/CLOSE, so same-level text merges by identity.
  /** @type {string[]} */
  let scopes = [];
  /** @type {LineToken | null} */
  let lastToken = null;

  /** @param {string} text */
  const pushText = (text) => {
    if (text === "") return;
    if (lastToken && lastToken.scopes === scopes) {
      lastToken.text += text;
    } else {
      lastToken = { text, scopes };
      line.push(lastToken);
    }
  };

  for (const event of events) {
    if (event.t === OPEN) {
      stack.push(event.s);
      scopes = stack.slice();
    } else if (event.t === CLOSE) {
      stack.pop();
      scopes = stack.slice();
    } else {
      const text = event.v;
      let start = 0;
      for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10) {
          pushText(text.slice(start, i));
          lines.push(line);
          line = [];
          lastToken = null;
          start = i + 1;
        }
      }
      pushText(text.slice(start));
    }
  }
  lines.push(line);
  return lines;
}

/**
 * @param {{ classPrefix?: string }} [options]
 * @returns {import("./engine.d.ts").Renderer<string>}
 */
export function createHtmlRenderer(options) {
  return { render: (events) => renderHtml(events, options) };
}

/** @returns {import("./engine.d.ts").Renderer<TokenRange[]>} */
export function createRangeRenderer() {
  return { render: toRanges };
}

/** @returns {import("./engine.d.ts").Renderer<LineToken[][]>} */
export function createLineRenderer() {
  return { render: tokenLines };
}

/**
 * Registers `language` and its dependencies, skipping ones already
 * registered. Compares `ir.name` because `get` resolves aliases ("ini"
 * aliases "toml", so `get("toml")` can hit before toml is loaded).
 * @param {Registry} registry
 * @param {Language} language
 */
export function registerAll(registry, language) {
  const canonicalName = language.name.toLowerCase();
  const existing = registry.get(canonicalName);
  if (existing && existing.ir.name === canonicalName) return;
  registry.register(language.register);
  for (const dependency of language.dependencies || []) {
    registerAll(registry, dependency);
  }
}

export function createRegistry() {
  /** @type {Map<string, Program>} */
  const programs = new Map();
  /** @type {Map<string, string>} */
  const aliases = new Map();

  const registry = {
    /**
     * @param {GrammarIR} ir
     * @returns {Program}
     */
    register(ir) {
      const program = compileProgram(ir);
      programs.set(ir.name.toLowerCase(), program);
      for (const alias of ir.aliases || []) {
        aliases.set(alias.toLowerCase(), ir.name.toLowerCase());
      }
      return program;
    },

    /**
     * @param {string} name
     * @returns {Program | undefined}
     */
    get(name) {
      const key = (name || "").toLowerCase();
      const aliasKey = aliases.get(key);
      return (
        programs.get(key) ??
        (aliasKey === undefined ? undefined : programs.get(aliasKey))
      );
    },

    /** @returns {string[]} */
    listLanguages() {
      return [...programs.keys()];
    },

    /**
     * @param {string} code
     * @param {string} language
     * @returns {{ language: string, relevance: number, events: ScopeEvent[] }}
     */
    tokenize(code, language) {
      const program = this.get(language);
      if (!program) throw new UnknownLanguageError(language);
      const tokenizer = new Tokenizer(this, program);
      tokenizer.code = code;
      tokenizer.run();
      const result = tokenizer.finish();
      return {
        language,
        relevance: result.relevance,
        events: result.events,
      };
    },

    /**
     * Detection scoring run: aborts (scores 0) on `illegal`.
     * @param {string} code
     * @param {string} language
     * @returns {{ relevance: number, events: ScopeEvent[] }}
     */
    score(code, language) {
      const program = this.get(language);
      if (program) {
        const tokenizer = new Tokenizer(this, program, { detect: true });
        tokenizer.code = code;
        try {
          tokenizer.run();
          if (!tokenizer.aborted) {
            const result = tokenizer.finish();
            return { relevance: result.relevance, events: result.events };
          }
        } catch {
          // A grammar that errors (e.g. TokenizerLoopError) scores 0.
        }
      }
      return { relevance: 0, events: [{ t: TEXT, v: code }] };
    },

    /**
     * @param {string} code
     * @param {string[] | null} [subset]
     * @returns {{
     *   language: string | undefined,
     *   relevance: number,
     *   events: ScopeEvent[],
     *   secondBest?: { language: string | undefined, relevance: number },
     * }}
     */
    tokenizeAuto(code, subset) {
      const candidates = (subset || this.listLanguages()).filter((name) => {
        const program = this.get(name);
        return program && !program.ir.disableAutodetect;
      });
      const sample =
        code.length > DETECT_SAMPLE_LIMIT
          ? code.slice(0, DETECT_SAMPLE_LIMIT)
          : code;
      /** @type {{ language: string | undefined, relevance: number, events: ScopeEvent[], secondBest?: { language: string | undefined, relevance: number } }} */
      let best = {
        language: undefined,
        relevance: 0,
        events: [{ t: TEXT, v: code }],
      };
      /** @type {{ language: string | undefined, relevance: number, events: ScopeEvent[] } | undefined} */
      let secondBest;
      for (const name of candidates) {
        const scored = this.score(sample, name);
        const entry = {
          language: name,
          relevance: scored.relevance,
          events: scored.events,
        };
        if (this.beats(entry, best)) {
          secondBest = best.language ? best : secondBest;
          best = entry;
        } else if (!secondBest || entry.relevance > secondBest.relevance) {
          secondBest = entry;
        }
      }
      if (secondBest) {
        best.secondBest = {
          language: secondBest.language,
          relevance: secondBest.relevance,
        };
      }
      // Re-tokenize the winner over the full code; secondBest stays
      // sample-scored.
      if (best.language && sample.length !== code.length) {
        const full = this.tokenize(code, best.language);
        best = { ...best, relevance: full.relevance, events: full.events };
      }
      return best;
    },

    /**
     * Relevance ordering with hljs's supersetOf tie-break.
     * @param {{ language: string | undefined, relevance: number }} a
     * @param {{ language: string | undefined, relevance: number }} b
     * @returns {boolean}
     */
    beats(a, b) {
      if (a.relevance !== b.relevance) return a.relevance > b.relevance;
      if (a.language && b.language) {
        const aLang = this.get(a.language);
        const bLang = this.get(b.language);
        if (aLang?.ir.supersetOf === b.language) return true;
        if (bLang?.ir.supersetOf === a.language) return false;
      }
      return false; // stable: first candidate wins ties
    },

    /**
     * @param {string} code
     * @param {{ language: string }} options
     * @returns {HighlightResult}
     */
    highlight(code, { language }) {
      const result = this.tokenize(code, language);
      return {
        language,
        relevance: result.relevance,
        value: renderHtml(result.events),
        events: result.events,
      };
    },

    /**
     * @param {string} code
     * @param {string[]} [subset]
     */
    highlightAuto(code, subset) {
      const result = this.tokenizeAuto(code, subset);
      return {
        language: result.language,
        relevance: result.relevance,
        value: renderHtml(result.events),
        events: result.events,
        secondBest: result.secondBest,
      };
    },

    /**
     * @param {string} code
     * @param {{ language: string }} options
     * @returns {TokenRange[]}
     */
    tokenizeRanges(code, { language }) {
      return toRanges(this.tokenize(code, language).events);
    },

    /**
     * Streaming session. Only complete lines are tokenized, so line-anchored
     * matches behave as in the final document. `from` preloads `code`
     * (optionally resuming at `snapshot`) for stepping with `advance()`;
     * `from.windowed` bounds scans for callers that expect to stop soon.
     * @param {string} language
     * @param {{ from?: { code: string, snapshot?: Snapshot, windowed?: boolean } }} [options]
     * @returns {StreamSession}
     */
    createSession(language, { from } = {}) {
      const program = this.get(language);
      if (!program) throw new UnknownLanguageError(language);
      let tokenizer = new Tokenizer(this, program);
      const registry = this;
      let staged = "";
      // Last `\n` in `staged` (or -1), tracked so `append()` only searches
      // new text; rescanning `staged` is quadratic on a long open line.
      let stagedNewline = -1;
      let fed = from ? from.code : "";
      if (from) {
        tokenizer.code = from.code;
        if (from.snapshot) tokenizer.restore(from.snapshot);
        if (from.windowed) tokenizer.windowed = true;
      }
      /**
       * Built lazily on the first `replace()`.
       * @type {IncrementalParse | null}
       */
      let incremental = null;
      return {
        /** @param {string} text */
        append(text) {
          fed += text;
          const textNewline = text.lastIndexOf("\n");
          if (textNewline >= 0) stagedNewline = staged.length + textNewline;
          staged += text;
          if (stagedNewline >= 0) {
            tokenizer.code += staged.slice(0, stagedNewline + 1);
            staged = staged.slice(stagedNewline + 1);
            stagedNewline = -1;
            tokenizer.run();
          }
        },
        /** @param {number} stopAt */
        advance(stopAt) {
          tokenizer.run(stopAt);
        },
        /**
         * Like `append(text.slice(fedLength))`, but slicing `text` shares its
         * storage instead of concatenating (which the regex engine would
         * re-flatten on every scan).
         * @param {string} text
         */
        feed(text) {
          fed = text;
          const lineEnd = text.lastIndexOf("\n") + 1;
          staged = text.slice(lineEnd);
          stagedNewline = -1;
          if (lineEnd > tokenizer.code.length) {
            tokenizer.code = text.slice(0, lineEnd);
            tokenizer.run();
          }
        },
        /**
         * Replaces fed `[from, to)` with `text`, re-parsing only the affected
         * region. Returns how many leading `events()` entries are unchanged
         * objects (0 on the first call).
         * @param {number} from
         * @param {number} to
         * @param {string} text
         * @returns {number}
         */
        replace(from, to, text) {
          const first = !incremental;
          if (!incremental) {
            incremental = parseIncremental(
              /** @type {Registry} */ (registry),
              language,
              fed,
            );
          }
          const previous = incremental;
          const newCode = fed.slice(0, from) + text + fed.slice(to);
          incremental = reparseIncremental(
            /** @type {Registry} */ (registry),
            language,
            previous,
            newCode,
          );
          fed = newCode;
          const lastCheckpoint = /** @type {Snapshot} */ (
            incremental.checkpoints.at(-1)
          );
          tokenizer = new Tokenizer(registry, program);
          tokenizer.code = fed.slice(0, lastCheckpoint.pos);
          tokenizer.restore(lastCheckpoint);
          // `lastCheckpoint` precedes `parseIncremental`'s final `finish()`,
          // so keep only events up to its count and re-run to resolve the
          // rest live. Truncate in place when `reparseIncremental` returned
          // a fresh array; copy when it returned `previous` unchanged, whose
          // events array was already handed out by `events()`/`finish()`.
          tokenizer.events =
            incremental === previous
              ? incremental.events.slice(0, lastCheckpoint.eventCount)
              : incremental.events;
          tokenizer.events.length = lastCheckpoint.eventCount;
          tokenizer.run();
          staged = fed.slice(tokenizer.pos);
          stagedNewline = staged.lastIndexOf("\n");
          if (first) return 0;
          if (incremental === previous) return lastCheckpoint.eventCount;
          return incremental.reuse?.head ?? 0;
        },
        /**
         * Binary search over the last `replace()`'s checkpoints. At a
         * checkpoint the open scopes are exactly the scoped frames', and the
         * unemitted text is `buffer`, ending at `pos`.
         * @param {{ eventCount?: number, textPos?: number }} limits
         * @returns {{ textPos: number, eventCount: number, scopes: string[] } | undefined}
         */
        checkpointBefore({
          eventCount = Number.POSITIVE_INFINITY,
          textPos = Number.POSITIVE_INFINITY,
        }) {
          const list = incremental ? incremental.checkpoints : [];
          let lo = 0;
          let hi = list.length - 1;
          /** @type {Snapshot | undefined} */
          let found;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const checkpoint = /** @type {Snapshot} */ (list[mid]);
            if (
              checkpoint.eventCount <= eventCount &&
              checkpoint.pos - checkpoint.buffer.length <= textPos
            ) {
              found = checkpoint;
              lo = mid + 1;
            } else {
              hi = mid - 1;
            }
          }
          if (!found) return undefined;
          /** @type {string[]} */
          const scopes = [];
          for (const frame of found.frames) {
            const scope =
              frame.idx === 0 ? undefined : program.states[frame.idx]?.scope;
            if (scope) scopes.push(scope);
          }
          return {
            textPos: found.pos - found.buffer.length,
            eventCount: found.eventCount,
            scopes,
          };
        },
        /**
         * `canonicalize` re-tokenizes the full text in one pass, for
         * multi-line lookahead (e.g. ruby heredocs) that streaming can miss.
         * @param {{ canonicalize?: boolean }} [options]
         * @returns {HighlightResult}
         */
        finish({ canonicalize = false } = {}) {
          if (canonicalize) return registry.highlight(fed, { language });
          tokenizer.code += staged;
          staged = "";
          stagedNewline = -1;
          tokenizer.run();
          const result = tokenizer.finish();
          const events = result.events;
          // `value` renders lazily (most callers only read `events`), and
          // only up to `eventCount`: a later append() pushes onto `events`.
          const eventCount = events.length;
          /** @type {string | undefined} */
          let value;
          return {
            language,
            relevance: result.relevance,
            events,
            get value() {
              value ??= renderHtml(
                events.length === eventCount
                  ? events
                  : events.slice(0, eventCount),
              );
              return value;
            },
          };
        },
        snapshot: () => tokenizer.snapshot(),
        events: () => tokenizer.events,
        /** @returns {ScopeEvent[]} */
        takeEvents() {
          const taken = tokenizer.events;
          tokenizer.events = [];
          return taken;
        },
      };
    },

    /**
     * Emits only post-snapshot events.
     * @param {string} code
     * @param {string} language
     * @param {Snapshot} snap
     * @returns {{ events: ScopeEvent[], relevance: number }}
     */
    resume(code, language, snap) {
      const program = this.get(language);
      // Unvalidated: an unknown language throws a TypeError, not
      // UnknownLanguageError.
      const tokenizer = new Tokenizer(this, /** @type {Program} */ (program));
      tokenizer.code = code;
      tokenizer.restore(snap);
      tokenizer.run();
      const result = tokenizer.finish();
      return { events: result.events, relevance: result.relevance };
    },
  };

  return registry;
}
