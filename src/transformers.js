/**
 * Composable transforms over a tokenized `ScopeEvent[]` stream, meant to run
 * between `Registry#tokenize` and a renderer (`renderHtml`/`toRanges`/
 * `tokenLines`). Every transform here preserves the engine's event-stream
 * invariant (see engine.d.ts's top doc comment): `TEXT` values concatenated
 * in order still equal the tokenized source, and the stream stays balanced -
 * every `OPEN` has a matching later `CLOSE`, properly nested.
 */

/**
 * @typedef {import("./engine.d.ts").ScopeEvent} ScopeEvent
 * @typedef {import("./transformers.d.ts").EventTransform} EventTransform
 */

const TEXT = 0;
const OPEN = 1;
const CLOSE = 2;

const NEWLINE_SPLIT_RE = /(\n)/;

/**
 * @param {ScopeEvent[]} events
 * @param {EventTransform[]} fns
 * @returns {ScopeEvent[]}
 */
export function transformEvents(events, fns) {
  return fns.reduce((acc, fn) => fn(acc), events);
}

/**
 * @param {RegExp} pattern
 * @param {string} [scope]
 * @returns {EventTransform}
 */
export function markPattern(pattern, scope = "mark") {
  if (!pattern.global) {
    throw new Error('markPattern requires a global RegExp (the "g" flag)');
  }
  return (events) => {
    /** @type {ScopeEvent[]} */
    const out = [];
    for (const ev of events) {
      if (ev.t !== TEXT) {
        out.push(ev);
        continue;
      }
      const text = ev.v;
      pattern.lastIndex = 0;
      let last = 0;
      for (
        let match = pattern.exec(text);
        match !== null;
        match = pattern.exec(text)
      ) {
        if (match.index > last) {
          out.push({ t: TEXT, v: text.slice(last, match.index) });
        }
        out.push({ t: OPEN, s: scope });
        out.push({ t: TEXT, v: match[0] });
        out.push({ t: CLOSE });
        last = match.index + match[0].length;
        if (match[0].length === 0) pattern.lastIndex++;
      }
      if (last < text.length) out.push({ t: TEXT, v: text.slice(last) });
    }
    return out;
  };
}

/**
 * @param {{ tabs?: boolean, trailingSpace?: boolean, tabScope?: string, trailingScope?: string }} [options]
 * @returns {EventTransform}
 */
export function markWhitespace({
  tabs = true,
  trailingSpace = true,
  tabScope = "ws-tab",
  trailingScope = "ws-trailing",
} = {}) {
  /** @type {EventTransform[]} */
  const fns = [];
  if (tabs) fns.push(markPattern(/\t/g, tabScope));
  if (trailingSpace) fns.push(markPattern(/[ \t]+$/gm, trailingScope));
  return (events) => transformEvents(events, fns);
}

/**
 * @param {Record<number, "mark" | "ins" | "del">} lines
 * @returns {EventTransform}
 */
export function markLines(lines) {
  if (Object.keys(lines).length === 0) return (events) => events;

  return (events) => {
    /** @type {ScopeEvent[]} */
    const out = [];
    let line = 1;
    /** @type {string[]} */
    const openScopes = [];
    let wrapping = false;

    const closeOpenScopes = () => {
      for (let i = 0; i < openScopes.length; i++) out.push({ t: CLOSE });
    };
    const reopenScopes = () => {
      for (const scope of openScopes) out.push({ t: OPEN, s: scope });
    };
    // A scope already open (or still open past the wrapped line) is
    // "resumed" by closing it, opening the wrapper, then reopening it
    // inside - the only way the wrapper's OPEN/CLOSE stays a validly
    // nested pair instead of straddling it.
    const startWrap = () => {
      closeOpenScopes();
      out.push({ t: OPEN, s: /** @type {string} */ (lines[line]) });
      reopenScopes();
      wrapping = true;
    };
    /** @param {boolean} continueOpenScopes */
    const endWrap = (continueOpenScopes) => {
      closeOpenScopes();
      out.push({ t: CLOSE });
      wrapping = false;
      if (continueOpenScopes && openScopes.length > 0) reopenScopes();
    };
    const maybeStartWrap = () => {
      if (!wrapping && lines[line] !== undefined) startWrap();
    };

    for (const ev of events) {
      if (ev.t === OPEN) {
        maybeStartWrap();
        openScopes.push(ev.s);
        out.push(ev);
      } else if (ev.t === CLOSE) {
        maybeStartWrap();
        openScopes.pop();
        out.push(ev);
      } else {
        for (const piece of ev.v.split(NEWLINE_SPLIT_RE)) {
          if (piece === "\n") {
            if (wrapping) endWrap(true);
            out.push({ t: TEXT, v: "\n" });
            line++;
          } else if (piece !== "") {
            maybeStartWrap();
            out.push({ t: TEXT, v: piece });
          }
        }
      }
    }
    if (wrapping) endWrap(false);
    return out;
  };
}
