/**
 * Highlighting engine (MIT, no highlight.js code). Runs a serializable
 * grammar IR built from hljs grammars by scripts/convert-grammars.ts.
 *
 * Output is a flat scope-event stream. HTML and CSS Custom Highlight ranges
 * are two renderers over the same events. Tokenizer state is serializable so
 * parses can checkpoint, resume, and stream. Callback behavior from hljs
 * grammars becomes declarative IR flags (endSameAsBegin, onlyAtInputStart,
 * notAfterDot).
 *
 * Scope names stay on hljs's vocabulary (`hljs-*` classes) so existing themes
 * and the CSS-Highlight theme converter keep working.
 */

/**
 * @typedef {import("./engine.d.ts").GrammarIR} GrammarIR
 * @typedef {import("./engine.d.ts").GrammarState} GrammarState
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./engine.d.ts").TokenRange} TokenRange
 * @typedef {import("./engine.d.ts").HighlightResult} HighlightResult
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 */

/**
 * A grammar plus its transitive `subLanguage` dependencies, as passed to
 * `registerAll` (e.g. astro's entry lists html/typescript/css/javascript).
 * @typedef {{ name: string, register: GrammarIR, dependencies?: Language[] }} Language
 */

/**
 * A grammar state after `compileProgram` has compiled its string patterns
 * into RegExps (and normalized `keywords`/`relevance` - the IR omits
 * `relevance` when it's the default 1, but the compiled form always has it).
 * @typedef {Omit<GrammarState, "keywords" | "relevance"> & {
 *   relevance: number,
 *   keywords: Record<string, [string, number]> | null,
 *   beginRe: RegExp | null,
 *   endRe: RegExp | null,
 *   illegalRe: RegExp | null,
 *   keywordRe: RegExp | null,
 * }} CompiledState
 */

/**
 * @typedef {{ ir: GrammarIR, states: CompiledState[] }} Program
 */

/**
 * Memoized result of scanning a single rule/frame's pattern: `match` is the
 * earliest guard-passing match at or after the position `this.pos` had when
 * it was computed (or `null` if none exists in `this.code` as of `codeLen`
 * characters). See `Tokenizer#cachedMatch`.
 * @typedef {{ codeLen: number, match: RegExpExecArray | null }} MatchCache
 */

/**
 * One entry of the tokenizer's parse stack. `endCache` memoizes this
 * frame's end-pattern scan (see `cachedMatch`); it's per-frame rather than
 * per-state because `endSameAsBegin`'s guard depends on this frame's own
 * `beginMatch`, and two frames can share the same state (recursive nesting).
 * `beginPos` is this frame's begin match's position in `this.code` (see
 * `subContinuations` below).
 * @typedef {{ idx: number, state: CompiledState, beginMatch: string | undefined, beginPos: number, endCache?: MatchCache }} Frame
 */

/**
 * Serializable snapshot of a stack frame (see `Tokenizer#snapshot`).
 * @typedef {{ idx: number, beginMatch: string | undefined, beginPos: number }} FrameSnapshot
 */

/**
 * A sub-language's carried continuation, scoped to one embedding
 * occurrence (see `subContinuations`).
 * @typedef {{ beginPos: number, frames: FrameSnapshot[] }} SubContinuation
 */

/**
 * The subset of the registry's shape that `Tokenizer` itself relies on
 * (embedded-language lookups). The object built by `createRegistry()` has
 * more members than this, but it structurally satisfies it.
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
 * @typedef {{ match: RegExpExecArray, kind: "begin" | "end" | "illegal", data: number | null }} MatchResult
 */

const MAX_KEYWORD_HITS = 7;

/**
 * Max leading characters used for auto-detection scoring. Keyword relevance
 * caps at MAX_KEYWORD_HITS per word, so scanning past a few KB rarely
 * changes the winner but costs O(candidates × length). tokenizeAuto still
 * re-tokenizes the winner over the full `code` before returning.
 */
const DETECT_SAMPLE_LIMIT = 8000;

// Tokenizer#isTrulyOpeningTag lookaheads.
const XML_TAG_DEFAULT_PARAM_RE = /^\s*=/;
const XML_TAG_EXTENDS_CONSTRAINT_RE = /^\s+extends\s+/;

/** Event kinds. Events are {t: TEXT, v} | {t: OPEN, s} | {t: CLOSE}. */
export const TEXT = 0;
export const OPEN = 1;
export const CLOSE = 2;

/** @param {string} value */
export function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Compiles an IR (plain JSON) into an executable program.
 * @param {GrammarIR} ir
 * @returns {Program}
 */
function compileProgram(ir) {
  const flags = `mg${ir.caseInsensitive ? "i" : ""}${ir.unicode ? "u" : ""}`;
  /** @param {string | undefined} src */
  const re = (src) => (src == null ? null : new RegExp(src, flags));
  const states = ir.states.map((s) => ({
    ...s,
    // Omitted in the shipped IR when it's the default (see convert-language.ts).
    relevance: s.relevance ?? 1,
    keywords: s.keywords
      ? Object.assign(Object.create(null), s.keywords)
      : null,
    beginRe: re(s.begin),
    endRe: re(s.end),
    illegalRe: re(s.illegal),
    keywordRe: s.keywords ? re(s.keywordPattern || "\\w+") : null,
  }));
  return { ir, states };
}

class Tokenizer {
  /**
   * @param {EngineRegistry} registry
   * @param {Program} program
   * @param {{ detect?: boolean }} [options] `detect` scores relevance and
   *   aborts on `illegal` (mirrors hljs auto-detection semantics).
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
    /** @type {Frame[]} */
    this.frames = [
      {
        idx: 0,
        // states[0] (the root state) always exists: compileProgram maps
        // ir.states 1:1, and every grammar has a root state.
        state: /** @type {CompiledState} */ (program.states[0]),
        beginMatch: undefined,
        beginPos: 0,
      },
    ];
    this.aborted = false;
    this.iterations = 0;
    /**
     * Embedded-language parse state, carried across segments by name - but
     * only for the *same* embedding occurrence (matched by `beginPos`, the
     * code position where that occurrence's frame began). Without the
     * `beginPos` guard, a later, textually unrelated occurrence of the same
     * sub-language name would incorrectly resume from an earlier, already-
     * closed occurrence's leftover frames instead of starting fresh (e.g.
     * two independent markdown fenced blocks that both embed "xml": the
     * second would wrongly inherit the first's still-open-tag state).
     * @type {Record<string, SubContinuation>}
     */
    this.subContinuations = Object.create(null);
    /**
     * Memoized begin-pattern scans, indexed by state index (see
     * `cachedMatch`). A rule's "next match" is independent of which parent
     * state referenced it, so this is shared across all of them rather than
     * being per-frame like `Frame#endCache`.
     * @type {(MatchCache | undefined)[]}
     */
    this.beginCache = [];
  }

  /** @returns {Frame} */
  get top() {
    // Root frame (idx 0) is never popped; doEnd stops at depth >= 1.
    return /** @type {Frame} */ (this.frames[this.frames.length - 1]);
  }

  // --- emission ---

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
   * Emits the capture groups of a begin/end match (hljs "multi-class").
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

  // --- buffered text ---

  flush() {
    const state = this.top.state;
    if (state.subLanguage == null) this.keywordProcess(this.buffer, state);
    else this.flushSubLanguage(state);
    this.buffer = "";
  }

  /**
   * @param {string} text
   * @param {CompiledState} state
   */
  keywordProcess(text, state) {
    if (!state.keywords) {
      this.text(text);
      return;
    }
    const keywords = state.keywords;
    // keywordRe is always compiled alongside keywords (see compileProgram),
    // so it is non-null whenever `keywords` is set.
    const keywordRe = /** @type {RegExp} */ (state.keywordRe);
    let lastIndex = 0;
    let buf = "";
    keywordRe.lastIndex = 0;
    let match = keywordRe.exec(text);
    while (match) {
      buf += text.substring(lastIndex, match.index);
      const word = this.program.ir.caseInsensitive
        ? match[0].toLowerCase()
        : match[0];
      const data = keywords[word];
      if (data) {
        const [kind, keywordRelevance] = data;
        this.text(buf);
        buf = "";
        this.kwHits[word] = (this.kwHits[word] || 0) + 1;
        if (this.kwHits[word] <= MAX_KEYWORD_HITS) {
          this.relevance += keywordRelevance;
        }
        if (kind.startsWith("_")) {
          // relevance-only keyword, not highlighted
          buf += match[0];
        } else {
          this.emitKeyword(match[0], kind);
        }
      } else {
        buf += match[0];
      }
      lastIndex = keywordRe.lastIndex;
      match = keywordRe.exec(text);
    }
    buf += text.substring(lastIndex);
    this.text(buf);
  }

  /** @param {CompiledState} state */
  flushSubLanguage(state) {
    const text = this.buffer;
    if (text === "") return;
    // flush() only calls this when state.subLanguage != null.
    const subLanguage = /** @type {string | string[]} */ (state.subLanguage);
    /** @type {{ language: string | undefined, relevance: number, events: ScopeEvent[] }} */
    let result;
    if (typeof subLanguage === "string") {
      const program = this.registry.get(subLanguage);
      if (!program) {
        this.text(text);
        return;
      }
      // Later segments of the *same* embedding occurrence resume where the
      // previous segment's parse left off (e.g. still inside an open tag).
      // Guarded by beginPos: a record left by a different, already-closed
      // occurrence of this sub-language must not leak into this one.
      const beginPos = this.top.beginPos;
      const sub = new Tokenizer(this.registry, program);
      sub.code = text;
      const record = this.subContinuations[subLanguage];
      const carried = record?.beginPos === beginPos ? record.frames : undefined;
      if (carried) {
        sub.frames = carried.map((f) => ({
          idx: f.idx,
          // f.idx was produced by this same program's frame indices, so
          // it's always a valid index into program.states.
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
      this.open(`language:${result.language}`);
      for (const event of result.events) this.events.push(event);
      this.close();
    } else {
      for (const event of result.events) this.events.push(event);
    }
  }

  // --- scanning ---

  /**
   * Finds the earliest valid match of `re` at or after `from`, skipping
   * matches rejected by `guard`.
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
   * Memoized `execValid(re, this.pos, guard)`. Without this, every token
   * boundary re-scans every rule's pattern from scratch. A cached match stays
   * valid until `this.pos` passes it; a cached miss stays valid until the
   * code grows (streaming append).
   * @param {RegExp} re
   * @param {((m: RegExpExecArray) => boolean) | null} guard
   * @param {MatchCache | undefined} cache
   * @returns {MatchCache}
   */
  cachedMatch(re, guard, cache) {
    if (cache) {
      if (cache.match !== null && cache.match.index >= this.pos) return cache;
      if (cache.match === null && cache.codeLen === this.code.length)
        return cache;
    }
    return {
      codeLen: this.code.length,
      match: this.execValid(re, this.pos, guard),
    };
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
    return null;
  }

  /**
   * hljs javascript/typescript JSX-vs-generic disambiguation for a `<Foo`
   * match. Re-evaluated when more code arrives so a streaming closing tag
   * still resolves it. See Tokenizer#isTrulyOpeningTag.
   * @param {RegExpExecArray} match
   * @returns {boolean}
   */
  isTrulyOpeningTag(match) {
    const afterIdx = match.index + match[0].length;
    const nextChar = this.code[afterIdx];
    // `Array<Array<number>>`, `<T, A extends keyof T, V>`
    if (nextChar === "<" || nextChar === ",") return false;
    // `<something>` - only a tag if a matching closing tag exists later on.
    if (
      nextChar === ">" &&
      this.code.indexOf(`</${match[0].slice(1)}`, afterIdx) === -1
    ) {
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
   * The next lexeme: earliest match wins; ties break by priority (begin
   * rules in order, then ends innermost-first, then illegal).
   * @returns {MatchResult | null}
   */
  nextMatch() {
    /** @type {RegExpExecArray | null} */
    let best = null;
    let bestPri = Number.POSITIVE_INFINITY;
    /** @type {"begin" | "end" | "illegal" | ""} */
    let bestKind = "";
    /** @type {number | null} */
    let bestData = null;
    /**
     * @param {RegExpExecArray | null} match
     * @param {number} pri
     * @param {"begin" | "end" | "illegal"} kind
     * @param {number | null} data
     */
    const consider = (match, pri, kind, data) => {
      if (!match) return;
      if (
        best === null ||
        match.index < best.index ||
        (match.index === best.index && pri < bestPri)
      ) {
        best = match;
        bestPri = pri;
        bestKind = kind;
        bestData = data;
      }
    };

    const state = this.top.state;
    for (let i = 0; i < state.rules.length; i++) {
      // rules[i] is in-bounds by the loop condition.
      const ruleIdx = /** @type {number} */ (state.rules[i]);
      const child = /** @type {CompiledState} */ (this.program.states[ruleIdx]);
      const cache = this.cachedMatch(
        // Every state referenced from a `rules` list has a `begin` pattern.
        /** @type {RegExp} */ (child.beginRe),
        this.beginGuard(child),
        this.beginCache[ruleIdx],
      );
      this.beginCache[ruleIdx] = cache;
      consider(cache.match, i, "begin", ruleIdx);
    }
    // End candidates walk outward while `endsWithParent` chains allow.
    let pri = state.rules.length;
    for (let d = this.frames.length - 1; d >= 1; d--) {
      // d ranges over [1, frames.length - 1], always in bounds.
      const frame = /** @type {Frame} */ (this.frames[d]);
      if (frame.state.endRe) {
        const guard = frame.state.endSameAsBegin
          ? (/** @type {RegExpExecArray} */ m) => m[1] === frame.beginMatch
          : null;
        const cache = this.cachedMatch(
          frame.state.endRe,
          guard,
          frame.endCache,
        );
        frame.endCache = cache;
        consider(cache.match, pri++, "end", d);
      }
      if (!frame.state.endsWithParent) break;
    }
    if (this.detect && state.illegalRe) {
      consider(
        this.execValid(state.illegalRe, this.pos, null),
        pri + 1,
        "illegal",
        null,
      );
    }
    return best === null
      ? null
      : {
          match: best,
          // consider() only assigns bestKind alongside best, so bestKind is
          // never "" once best is non-null.
          kind: /** @type {"begin" | "end" | "illegal"} */ (bestKind),
          data: bestData,
        };
  }

  // --- state transitions ---

  /**
   * Enters a state (shared by begin matches and `starts` chaining).
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
    // idx comes from nextMatch's "begin" data, which is always a valid
    // program.states index (see the ruleIdx comment above).
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
    // this.frames[d] is in bounds: d starts at `depth` (a frame index
    // returned by nextMatch) and only decreases while staying > 1.
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
      // frames.pop() is non-null: the loop condition (frames.length > d,
      // with d >= 1) guarantees at least one element remains before each pop.
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

  // --- main loop ---

  /** Consumes as much of `this.code` as possible; resumable after append. */
  run() {
    if (this.aborted) return;
    for (;;) {
      this.iterations++;
      if (this.iterations > 500000) {
        throw new Error(`potential infinite loop (${this.program.ir.name})`);
      }
      const found = this.nextMatch();
      if (!found) break;

      const framesBefore = this.frames.length;
      const topBefore = this.top;
      this.buffer += this.code.slice(this.pos, found.match.index);

      let consumed;
      if (found.kind === "illegal") {
        this.aborted = true;
        return;
      } else if (found.kind === "begin") {
        // consider() only passes null data for "illegal"; "begin" always
        // carries the numeric rule index.
        consumed = this.doBegin(
          found.match,
          /** @type {number} */ (found.data),
        );
      } else {
        // Same invariant as above: "end" always carries the numeric depth.
        consumed = this.doEnd(found.match, /** @type {number} */ (found.data));
      }

      let next = found.match.index + consumed;
      if (
        next === this.pos &&
        this.frames.length === framesBefore &&
        this.top === topBefore
      ) {
        // 0-width match made no progress; emit one char and move on
        // (mirrors hljs's badly-behaved-rule recovery).
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

  // --- checkpointing ---

  /**
   * Serializable parse state; everything needed to resume at `pos`.
   * Includes `subContinuations` (embedded-language parse state, e.g. an
   * astro frontmatter's typescript or a markdown fenced code block) - a
   * resumed parse that omitted it would silently restart every embedded
   * sublanguage from scratch instead of continuing it.
   * @returns {Snapshot}
   */
  snapshot() {
    return {
      pos: this.pos,
      buffer: this.buffer,
      relevance: this.relevance,
      kwHits: { ...this.kwHits },
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
    this.kwHits = Object.assign(Object.create(null), snap.kwHits);
    this.frames = snap.frames.map((f) => ({
      idx: f.idx,
      // f.idx was captured from this same program's frames by snapshot(),
      // so it's always a valid index into program.states.
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

// --- renderers ---

/**
 * hljs-compatible class for a scope (`hljs-` prefix, tiered scopes).
 * @param {string} name
 * @param {string} prefix
 */
function scopeToCssClass(name, prefix) {
  if (name.startsWith("language:")) {
    return name.replace("language:", "language-");
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
 * @param {ScopeEvent[]} events
 * @param {{ classPrefix?: string }} [options]
 * @returns {string} hljs-compatible HTML
 */
export function renderHtml(events, { classPrefix = "hljs-" } = {}) {
  let out = "";
  for (const event of events) {
    if (event.t === TEXT) out += escapeHtml(event.v);
    else if (event.t === OPEN) {
      out += `<span class="${scopeToCssClass(event.s, classPrefix)}">`;
    } else out += "</span>";
  }
  return out;
}

/**
 * Incrementally extends line-rendered HTML from `pendingHtml`/`openScopes`,
 * processing only `newEvents` since the last call. Avoids re-running
 * `renderHtml` + `splitLines` on the whole stream each repaint (O(n²) for
 * long streams). Used by HighlightStream.
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
  const reopenTags = () =>
    stack
      .map((scope) => `<span class="${scopeToCssClass(scope, classPrefix)}">`)
      .join("");
  let current = pendingHtml;
  for (const event of newEvents) {
    if (event.t === OPEN) {
      stack.push(event.s);
      current += `<span class="${scopeToCssClass(event.s, classPrefix)}">`;
    } else if (event.t === CLOSE) {
      stack.pop();
      current += "</span>";
    } else {
      const text = event.v;
      let start = 0;
      for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10) {
          current += escapeHtml(text.slice(start, i));
          current += "</span>".repeat(stack.length);
          completedLines.push(current);
          current = reopenTags();
          start = i + 1;
        }
      }
      current += escapeHtml(text.slice(start));
    }
  }
  return { completedLines, pendingHtml: current, openScopes: stack };
}

/**
 * Flat scope ranges for the CSS Custom Highlight API. Same shape as the old
 * token-ranges.js. A run of text is painted with its innermost scope;
 * sublanguage wrappers are transparent.
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
      stack.push(event.s.startsWith("language:") ? null : event.s);
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
 * Registers `language` and its `dependencies` (transitive subLanguage refs).
 * Skips languages already registered under their canonical name.
 *
 * Does not use `registry.get(language.name)` as the skip check. `get` resolves
 * aliases, so hljs's "ini" aliasing "toml" could make `get("toml")` look
 * registered when the real toml grammar has not been loaded yet.
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

// --- registry (public API) ---

export function createRegistry() {
  /** @type {Map<string, Program>} */
  const programs = new Map();
  /** @type {Map<string, string>} */
  const aliases = new Map();

  const registry = {
    /**
     * Registers a grammar IR (plain JSON, e.g. from convert.js).
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
      if (!program) throw new Error(`Unknown language: "${language}"`);
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
     * Detection scoring run: aborts on `illegal`, like hljs auto.
     * @param {string} code
     * @param {string} language
     * @returns {{ relevance: number, events: ScopeEvent[] }}
     */
    score(code, language) {
      const program = this.get(language);
      if (!program) return { relevance: 0, events: [{ t: TEXT, v: code }] };
      const tokenizer = new Tokenizer(this, program, { detect: true });
      tokenizer.code = code;
      try {
        tokenizer.run();
        if (tokenizer.aborted)
          return { relevance: 0, events: [{ t: TEXT, v: code }] };
        const result = tokenizer.finish();
        return { relevance: result.relevance, events: result.events };
      } catch {
        return { relevance: 0, events: [{ t: TEXT, v: code }] };
      }
    },

    /**
     * Auto-detection over any registered grammars (customs included).
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
        if (this.beats(entry, best, sample)) {
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
      // Winner was scored on `sample` only; re-tokenize the full `code`.
      // secondBest relevance stays sample-scored (informational only).
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
     * @param {string} _code
     * @returns {boolean}
     */
    beats(a, b, _code) {
      if (a.relevance !== b.relevance) return a.relevance > b.relevance;
      if (a.language && b.language) {
        const aLang = this.get(a.language);
        const bLang = this.get(b.language);
        if (aLang?.ir.supersetOf === b.language) return true;
        if (bLang?.ir.supersetOf === a.language) return false;
      }
      return false; // stable: first candidate wins ties
    },

    // hljs-shaped conveniences matching svelte-highlight's call sites

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
     * Streaming session. Appended text is tokenized incrementally; only
     * complete lines are consumed so line-anchored matches behave as they
     * will in the final document. `snapshot()`/`resume()` expose the
     * serializable checkpoint state.
     *
     * `options.from` resumes a parse at `snapshot` instead of from scratch.
     * Used by incremental-tokenize.js: `code` is text already scanned as of
     * `snapshot.pos`, and further `append()` calls extend it.
     * @param {string} language
     * @param {{ from?: { code: string, snapshot: Snapshot } }} [options]
     * @returns {StreamSession}
     */
    createSession(language, { from } = {}) {
      const program = this.get(language);
      if (!program) throw new Error(`Unknown language: "${language}"`);
      const tokenizer = new Tokenizer(this, program);
      const registry = this;
      let staged = "";
      let fed = from ? from.code : "";
      if (from) {
        tokenizer.code = from.code;
        tokenizer.restore(from.snapshot);
      }
      return {
        /** @param {string} text */
        append(text) {
          fed += text;
          staged += text;
          const newline = staged.lastIndexOf("\n");
          if (newline >= 0) {
            tokenizer.code += staged.slice(0, newline + 1);
            staged = staged.slice(newline + 1);
            tokenizer.run();
          }
        },
        /**
         * Multi-line lookahead (e.g. ruby heredocs) may need the full text
         * before it can match. `canonicalize` re-tokenizes in one O(n) pass.
         * @param {{ canonicalize?: boolean }} [options]
         * @returns {HighlightResult}
         */
        finish({ canonicalize = false } = {}) {
          if (canonicalize) return registry.highlight(fed, { language });
          tokenizer.code += staged;
          staged = "";
          tokenizer.run();
          const result = tokenizer.finish();
          return {
            language,
            relevance: result.relevance,
            events: result.events,
            value: renderHtml(result.events),
          };
        },
        snapshot: () => tokenizer.snapshot(),
        events: () => tokenizer.events,
      };
    },

    /**
     * Resumes a parse from a snapshot; emits only post-snapshot events.
     * @param {string} code
     * @param {string} language
     * @param {Snapshot} snap
     * @returns {{ events: ScopeEvent[], relevance: number }}
     */
    resume(code, language, snap) {
      const program = this.get(language);
      // resume() does not validate `language`; unregistered names throw in
      // Tokenizer when it reads program.states (same as before types).
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
