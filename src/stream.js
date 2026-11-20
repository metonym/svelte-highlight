/**
 * Streaming highlighted code into any element, with no framework. This is the
 * client-side rendering behind HighlightStream: it highlights a growing code
 * buffer and keeps the DOM work bounded. Sealed chunks are added once and
 * never rebuilt, tail lines are reused by line number, and `done` swaps in
 * one full highlight. The element should be a `<code>` inside a `<pre>`.
 */

import { createStreamHighlighter } from "./stream-highlighter.js";

/**
 * @typedef {{
 *   language: import("./languages").LanguageType<string>,
 *   code: string,
 *   done: boolean,
 *   caret: boolean,
 *   autoScroll: boolean,
 * }} StreamViewSettings
 */

/**
 * @typedef {Partial<StreamViewSettings> & {
 *   language: import("./languages").LanguageType<string>,
 *   onHighlight?: (highlighted: string) => void,
 *   onDone?: () => void,
 * }} StreamViewOptions
 */

/**
 * @typedef {{ html: string, newline: Text | undefined, span: HTMLElement }} TailLine
 * @typedef {{ html: string, nodes: ChildNode[] }} RenderedChunk
 */

// Within this many pixels of the bottom counts as "at the bottom".
const STICK_THRESHOLD = 4;

/**
 * @param {HTMLElement} element
 * @param {StreamViewOptions} options
 */
export function createStreamView(element, options) {
  const doc = /** @type {Document} */ (element.ownerDocument);
  const scroller = element.parentElement;
  const { onHighlight, onDone } = options;
  /** @type {StreamViewSettings} */
  const settings = {
    language: options.language,
    code: options.code ?? "",
    done: options.done ?? false,
    caret: options.caret ?? true,
    autoScroll: options.autoScroll ?? false,
  };

  const highlighter = createStreamHighlighter();
  let highlighted = "";
  // Reset when `done` goes false so a restarted stream calls `onDone` again.
  let doneReported = false;
  let stickToBottom = true;
  /** @type {number | undefined} */
  let frame;
  let destroyed = false;

  /** @type {"none" | "split" | "final"} */
  let mode = "none";
  /** @type {RenderedChunk[]} */
  let chunks = [];
  /** @type {Map<number, TailLine>} */
  const tail = new Map();
  /** @type {HTMLElement | undefined} */
  let caretElement;

  function onScroll() {
    if (!scroller) return;
    const gap =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    stickToBottom = gap <= STICK_THRESHOLD;
  }
  scroller?.addEventListener("scroll", onScroll, { passive: true });

  function cancelFrame() {
    if (frame === undefined) return;
    cancelAnimationFrame(frame);
    frame = undefined;
  }

  // Coalesce chunk bursts into one highlight pass per frame.
  function scheduleRender() {
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      render();
    });
  }

  function render() {
    const { code, language, done } = settings;
    const state = done
      ? highlighter.finish(code, language)
      : highlighter.update(code, language);
    highlighted = state.highlighted;
    if (done) renderFinal();
    else renderSplit(state);

    onHighlight?.(highlighted);
    if (done && !doneReported) {
      doneReported = true;
      onDone?.();
    }
    if (settings.autoScroll && stickToBottom && scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }

  function renderFinal() {
    element.innerHTML = highlighted;
    mode = "final";
    chunks = [];
    tail.clear();
  }

  /** @param {import("./stream-highlighter.js").StreamHighlighterState} state */
  function renderSplit(state) {
    if (mode !== "split") {
      element.textContent = "";
      mode = "split";
    }

    /** @type {ChildNode | null} */
    let before = null;
    if (settings.caret) {
      caretElement ??= createCaret();
      if (element.lastChild !== caretElement) element.append(caretElement);
      before = caretElement;
    } else {
      caretElement?.remove();
    }

    // Tail lines, keyed by line number: a line's span survives as the
    // stream grows, and only its contents change.
    const first = state.sealedLineCount;
    const end = first + state.tailLines.length;
    for (const [line, entry] of tail) {
      if (line >= first && line < end) continue;
      entry.newline?.remove();
      entry.span.remove();
      tail.delete(line);
    }
    for (let i = state.tailLines.length - 1; i >= 0; i--) {
      const line = first + i;
      const html = /** @type {string} */ (state.tailLines[i]);
      let entry = tail.get(line);
      if (!entry) {
        entry = createTailLine(line);
        tail.set(line, entry);
      }
      if (entry.html !== html) {
        entry.span.innerHTML = html;
        entry.html = html;
      }
      if (
        entry.span.parentNode !== element ||
        entry.span.nextSibling !== before
      ) {
        element.insertBefore(entry.span, before);
      }
      if (entry.newline && entry.newline.nextSibling !== entry.span) {
        element.insertBefore(entry.newline, entry.span);
      }
      before = entry.newline ?? entry.span;
    }

    // Sealed chunks: appended once. Only a non-append edit (a regenerate)
    // changes or drops one.
    const sealed = state.sealedChunks;
    for (let c = sealed.length; c < chunks.length; c++) {
      for (const node of /** @type {RenderedChunk} */ (chunks[c]).nodes) {
        node.remove();
      }
    }
    chunks.length = Math.min(chunks.length, sealed.length);
    for (let c = 0; c < sealed.length; c++) {
      const html = /** @type {string} */ (sealed[c]);
      const old = chunks[c];
      if (old?.html === html) continue;
      chunks[c] = { html, nodes: insertHtml(html, chunkAnchor(c, before)) };
      if (old) for (const node of old.nodes) node.remove();
    }
  }

  /**
   * The node a chunk's HTML goes before: the first node of the next rendered
   * chunk, or the start of the tail.
   * @param {number} c
   * @param {ChildNode | null} tailStart
   * @returns {ChildNode | null}
   */
  function chunkAnchor(c, tailStart) {
    for (let k = c; k < chunks.length; k++) {
      const node = /** @type {RenderedChunk} */ (chunks[k]).nodes[0];
      if (node) return node;
    }
    return tailStart;
  }

  /**
   * @param {string} html
   * @param {ChildNode | null} before
   * @returns {ChildNode[]}
   */
  function insertHtml(html, before) {
    const template = doc.createElement("template");
    template.innerHTML = html;
    const nodes = Array.from(template.content.childNodes);
    element.insertBefore(template.content, before);
    return nodes;
  }

  /**
   * @param {number} line
   * @returns {TailLine}
   */
  function createTailLine(line) {
    const span = doc.createElement("span");
    span.className = "highlight-stream-line";
    span.setAttribute("data-line", String(line));
    return {
      html: "",
      newline: line > 0 ? doc.createTextNode("\n") : undefined,
      span,
    };
  }

  function createCaret() {
    const caret = doc.createElement("span");
    caret.className = "highlight-stream-caret";
    caret.setAttribute("aria-hidden", "true");
    return caret;
  }

  // Draw the first frame now, so the element never shows empty.
  render();

  return {
    /** The latest highlighted HTML. */
    get highlighted() {
      return highlighted;
    },

    /**
     * Applies changed settings. While streaming, renders on the next frame;
     * `done` renders at once.
     * @param {Partial<StreamViewSettings>} next
     */
    update(next) {
      if (destroyed) return;
      let changed = false;
      for (const key of /** @type {(keyof StreamViewSettings)[]} */ (
        Object.keys(next)
      )) {
        const value = next[key];
        if (value === undefined || value === settings[key]) continue;
        // @ts-expect-error: `key` and `value` match.
        settings[key] = value;
        changed = true;
      }
      if (!changed) return;
      if (settings.done) {
        cancelFrame();
        render();
      } else {
        doneReported = false;
        scheduleRender();
      }
    },

    /** Stops rendering and removes the scroll listener. Leaves the DOM as is. */
    destroy() {
      destroyed = true;
      cancelFrame();
      scroller?.removeEventListener("scroll", onScroll);
    },
  };
}
