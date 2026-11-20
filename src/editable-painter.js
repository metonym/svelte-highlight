/**
 * Paints HighlightEditable's lines with either engine: "dom" (a span per
 * token) or "css-highlights" (plain text plus CSS Custom Highlight ranges).
 * Holds the incremental parse so each paint only re-tokenizes what changed.
 * Framework-free; needs a DOM, plus `CSS.highlights` for "css-highlights".
 */

import { createScopeHighlights } from "./css-highlights.js";
import { lineTokenRanges, retokenizedEnd } from "./editable-css-paint.js";
import { createDomLinePainter } from "./editable-dom-paint.js";
import { lineStartOffset, renderLines } from "./editable-line-dom.js";
import { toRanges } from "./engine.js";
import {
  parseIncremental,
  reparseIncremental,
} from "./incremental-tokenize.js";

/** @typedef {import("./css-highlights.js").PaintEngine} PaintEngine */

/** @param {HTMLElement} el @param {string} line */
const setHtml = (el, line) => {
  el.innerHTML = line;
};
/** @param {HTMLElement} el @param {string} line */
const setText = (el, line) => {
  el.textContent = line;
};

/**
 * @param {object} options
 * @param {() => HTMLElement} options.editor Read on each paint, so the
 *   element can be bound after the painter is made.
 * @param {import("./editable-line-dom.js").LineView} options.view
 * @param {import("./engine.d.ts").Registry} options.registry
 * @param {string} options.highlightPrefix Prefix for `CSS.highlights` names,
 *   unique per editor, e.g. `hljs-3`. Names are `${prefix}-${scope}`.
 */
export function createEditorPainter({
  editor,
  view,
  registry,
  highlightPrefix,
}) {
  /** @type {import("./incremental-tokenize.js").IncrementalParse | undefined} */
  let incrementalParse;
  const domLinePainter = createDomLinePainter();

  const cssHighlights = createScopeHighlights(highlightPrefix);
  /** @type {{ scope: string; range: Range }[][]} */
  let lineHighlightRanges = [];
  /** @type {import("./engine.d.ts").ScopeEvent[] | undefined} */
  let cssPaintedEvents;

  /** @param {string} code @param {string} language */
  function getEvents(code, language) {
    incrementalParse = incrementalParse
      ? reparseIncremental(registry, language, incrementalParse, code)
      : parseIncremental(registry, language, code);
    return incrementalParse.events;
  }

  /** @param {number} index */
  function clearLineHighlights(index) {
    const previous = lineHighlightRanges[index];
    if (!previous) return;
    for (const { scope, range } of previous) {
      cssHighlights.delete(scope, range);
    }
  }

  function clearHighlights() {
    cssHighlights.clear();
    lineHighlightRanges = [];
    cssPaintedEvents = undefined;
  }

  /** @type {import("./editable-line-dom.js").LineHooks} */
  const lineHooks = {
    onReset: () => clearHighlights(),
    onSplice: (index, removed, inserted) => {
      if (index >= lineHighlightRanges.length) return;
      for (let i = index; i < index + removed; i++) clearLineHighlights(i);
      lineHighlightRanges = lineHighlightRanges.slice(0, index).concat(
        Array.from({ length: inserted }, () => []),
        lineHighlightRanges.slice(index + removed),
      );
    },
  };

  // Re-registers ranges for lines from `first` (at offset `base`) through the
  // one ending at `end`; `tokenRanges` are relative to `base`. They're sorted
  // and disjoint, so `tokenIndex` only advances: O(lines + tokens).
  /**
   * @param {number} first
   * @param {number} base
   * @param {number} end
   * @param {{ start: number; end: number; scope: string }[]} tokenRanges
   */
  function paintLineHighlights(first, base, end, tokenRanges) {
    let tokenIndex = 0;
    let lineStart = 0;
    for (
      let i = first;
      i < view.lineEls.length && base + lineStart <= end;
      i++
    ) {
      clearLineHighlights(i);
      const lineEnd = lineStart + /** @type {number} */ (view.lineLengths[i]);
      const textNode = view.lineEls[i]?.firstChild;
      /** @type {{ scope: string; range: Range }[]} */
      const next = [];
      if (textNode) {
        while (
          tokenIndex < tokenRanges.length &&
          /** @type {{ end: number }} */ (tokenRanges[tokenIndex]).end <=
            lineStart
        ) {
          tokenIndex++;
        }
        for (
          let j = tokenIndex;
          j < tokenRanges.length &&
          /** @type {{ start: number }} */ (tokenRanges[j]).start < lineEnd;
          j++
        ) {
          const token = /** @type {(typeof tokenRanges)[number]} */ (
            tokenRanges[j]
          );
          if (token.end <= lineStart) continue;
          const start = Math.max(token.start, lineStart) - lineStart;
          const end = Math.min(token.end, lineEnd) - lineStart;
          if (start === end) continue;
          const range = new Range();
          range.setStart(textNode, start);
          range.setEnd(textNode, end);
          cssHighlights.add(token.scope, range);
          next.push({ scope: token.scope, range });
        }
      }
      lineHighlightRanges[i] = next;
      lineStart = lineEnd + 1; // +1 for the "\n" separator
    }
  }

  /** @param {string} code @param {string} language */
  function paintCssHighlights(code, language) {
    const changedIndex = renderLines(
      editor(),
      view,
      code.split("\n"),
      setText,
      lineHooks,
    );
    const previousEvents = cssPaintedEvents;
    const events = getEvents(code, language);
    cssPaintedEvents = events;

    if (changedIndex == null) {
      paintLineHighlights(0, 0, code.length, toRanges(events));
    } else {
      // One line's text changed, but its tokens can affect later lines
      // (typing `/*`): repaint through where the re-parse converged.
      const base = lineStartOffset(view, changedIndex);
      const end = retokenizedEnd(
        code,
        events,
        previousEvents,
        incrementalParse?.reuse,
        base,
      );
      paintLineHighlights(
        changedIndex,
        base,
        end,
        lineTokenRanges(events, base, end),
      );
    }
    return changedIndex;
  }

  return {
    /**
     * Brings the editor's lines up to date with `code`.
     * @param {string} code
     * @param {string} language
     * @param {PaintEngine} engine
     * @returns {number | null} The one changed line's index, or null when
     *   more than one line changed.
     */
    paint(code, language, engine) {
      if (engine === "css-highlights")
        return paintCssHighlights(code, language);
      const events = getEvents(code, language);
      return renderLines(
        editor(),
        view,
        domLinePainter.paint(events, code, language, incrementalParse?.reuse),
        setHtml,
        lineHooks,
      );
    },
    /** Drops cached parses, e.g. after a language or engine change. */
    reset() {
      incrementalParse = undefined;
      domLinePainter.reset();
    },
    /** Removes this editor's CSS highlights. */
    clearHighlights,
  };
}
