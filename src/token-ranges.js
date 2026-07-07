/**
 * Tokenize code into flat, absolute-offset scope ranges instead of HTML, via
 * hljs's `__emitter` hook. Used by the `HighlightEditable` "css-highlights"
 * engine, which paints tokens as `CSS.highlights` ranges over plain-text
 * nodes rather than wrapping them in `<span>`s.
 */

import hljs from "highlight.js/lib/core";

/** @typedef {import("highlight.js").Emitter} Emitter */
/** @typedef {new (options: unknown) => Emitter} EmitterConstructor */

// Nested `startScope` calls stack up (e.g. a keyword inside a sublanguage
// block); a run of text takes the innermost (top-of-stack) scope, matching
// how nested `<span>`s visually resolve to the last-applied color in the
// class-based renderer.
/** @implements {Emitter} */
class RangeEmitter {
  /** @param {unknown} options */
  constructor(options) {
    this.options = options;
    this.pos = 0;
    /** @type {string[]} */
    this.stack = [];
    /** @type {{ start: number; end: number; scope: string }[]} */
    this.ranges = [];
  }

  /** @param {string} text */
  addText(text) {
    if (text.length === 0) return;
    const scope = this.stack[this.stack.length - 1];
    if (scope !== undefined) {
      this.ranges.push({ start: this.pos, end: this.pos + text.length, scope });
    }
    this.pos += text.length;
  }

  /** @param {string} scope */
  startScope(scope) {
    this.stack.push(scope);
  }

  endScope() {
    this.stack.pop();
  }

  // Grammar modes (as opposed to keyword matches) open/close scopes through
  // this pair instead of startScope/endScope; same bookkeeping either way.
  /** @param {string} scope */
  openNode(scope) {
    this.startScope(scope);
  }

  closeNode() {
    this.endScope();
  }

  // Sublanguage blocks are parsed by a fresh emitter of this same class,
  // offsets relative to that block; splice its ranges in at our position.
  /** @param {RangeEmitter} emitter */
  __addSublanguage(emitter) {
    const base = this.pos;
    for (const range of emitter.ranges) {
      this.ranges.push({
        start: base + range.start,
        end: base + range.end,
        scope: range.scope,
      });
    }
    this.pos += emitter.pos;
  }

  // Matches hljs's `Emitter.toHTML` interface; unused since we return ranges.
  // biome-ignore lint/style/useNamingConvention: interface-mandated name
  toHTML() {
    return "";
  }

  finalize() {}
}

// hljs only exposes `__emitter` via the shared, module-level `configure()`
// call (not per-call options), so the default emitter class is captured
// lazily off a real highlight and restored synchronously after ours runs.
/** @type {EmitterConstructor} */
let defaultEmitter;

/**
 * @param {string} code
 * @param {string} languageName A language already registered with hljs.
 * @returns {{ start: number; end: number; scope: string }[]} Ranges sorted
 *   by `start`, offsets into `code`.
 */
export function tokenize(code, languageName) {
  if (defaultEmitter === undefined) {
    const probe = hljs.highlight("", { language: languageName });
    defaultEmitter = /** @type {EmitterConstructor} */ (
      /** @type {unknown} */ (probe._emitter.constructor)
    );
  }

  hljs.configure({ __emitter: RangeEmitter });
  try {
    const result = hljs.highlight(code, { language: languageName });
    return /** @type {RangeEmitter} */ (
      /** @type {unknown} */ (result._emitter)
    ).ranges;
  } finally {
    hljs.configure({ __emitter: defaultEmitter });
  }
}
