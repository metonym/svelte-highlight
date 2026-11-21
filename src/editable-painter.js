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

/**
 * @typedef {import("./css-highlights.js").PaintEngine} PaintEngine
 * @typedef {string | import("./theme.d.ts").ThemePalette} Theme
 */

/**
 * The resolver loads on the first themed "css-highlights" paint, so
 * "dom"-only pages don't bundle it. One load serves every editor.
 * @type {Promise<typeof import("./highlight-cascade.js")> | undefined}
 */
let cascadeLoad;

/** @type {typeof import("./highlight-cascade.js") | undefined} */
let cascadeModule;

function loadCascade() {
  // A static specifier, so bundlers split the module into its own chunk.
  cascadeLoad ??= import("./highlight-cascade.js").then(
    (module) => (cascadeModule = module),
    (error) => {
      cascadeLoad = undefined;
      throw error;
    },
  );
  return cascadeLoad;
}

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
 *   unique per editor, e.g. `hljs-3`. Names are `${prefix}-${scope}`, or
 *   `${prefix}-c<n>` with a theme.
 * @param {() => void} [options.onCascadeLoad] Called once the resolver for
 *   a theme loads. Until then, "css-highlights" paints as "dom" does, so
 *   the code never shows without colors. Repaint from here.
 */
export function createEditorPainter({
  editor,
  view,
  registry,
  highlightPrefix,
  onCascadeLoad,
}) {
  let destroyed = false;
  let cascadeRequested = false;
  /**
   * The engine the last paint drew with.
   * @type {PaintEngine}
   */
  let paintedEngine = "dom";
  /** @type {import("./incremental-tokenize.js").IncrementalParse | undefined} */
  let incrementalParse;
  const domLinePainter = createDomLinePainter();

  const cssHighlights = createScopeHighlights(highlightPrefix);
  /** @type {{ scope: string; range: Range }[][]} */
  let lineHighlightRanges = [];
  /** @type {import("./engine.d.ts").ScopeEvent[] | undefined} */
  let cssPaintedEvents;

  // With a theme, ranges are named by their resolved style, as in Highlight.
  // The run table only grows, so a name means the same style on every line.
  /** @type {Theme | undefined} */
  let theme;
  /** @type {import("./highlight-cascade.js").ThemeCascade | undefined} */
  let cascade;
  /** @type {import("./highlight-cascade.js").RunTable} */
  let runTable = { styles: [], names: new Map() };
  /** Rules in `styleElement`, as a count of `runTable.styles`. */
  let styledCount = 0;
  /** @type {HTMLStyleElement | undefined} */
  let styleElement;

  function outsideColor() {
    const outside = editor().closest("pre")?.parentElement;
    return outside ? getComputedStyle(outside).color : null;
  }

  /**
   * @param {import("./engine.d.ts").ScopeEvent[]} events
   * @returns {import("./engine.d.ts").TokenRange[]}
   */
  function tokenRanges(events) {
    if (theme === undefined || !cascadeModule) return toRanges(events);
    cascade ??= cascadeModule.createThemeCascade(theme, outsideColor);
    return cascadeModule.cascadeRanges(events, cascade, runTable).ranges;
  }

  // Adds rules for styles first seen in this paint.
  function syncStyle() {
    const { styles } = runTable;
    if (styles.length === styledCount || !cascadeModule) return;
    styledCount = styles.length;
    if (!styleElement) {
      const el = editor();
      const doc = /** @type {Document} */ (el.ownerDocument);
      const root = el.getRootNode();
      styleElement = doc.createElement("style");
      // In a shadow root, rules in the document head don't apply.
      const parent =
        root.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in root
          ? /** @type {ShadowRoot} */ (root)
          : doc.head;
      parent.append(styleElement);
    }
    styleElement.textContent = cascadeModule.cascadeHighlightRules(
      styles,
      highlightPrefix,
    );
  }

  function removeStyle() {
    styleElement?.remove();
    styleElement = undefined;
    styledCount = 0;
  }

  function requestCascade() {
    if (cascadeRequested) return;
    cascadeRequested = true;
    loadCascade().then(
      () => {
        // Destroyed meanwhile: paint nothing.
        if (!destroyed) onCascadeLoad?.();
      },
      () => {
        // Keep the "dom" paint. A later paint tries again.
        cascadeRequested = false;
      },
    );
  }

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

    // Nothing painted yet (e.g. after a theme change): paint every line.
    if (changedIndex == null || previousEvents === undefined) {
      paintLineHighlights(0, 0, code.length, tokenRanges(events));
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
        lineTokenRanges(events, base, end, tokenRanges),
      );
    }
    syncStyle();
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
      if (engine === "css-highlights" && theme !== undefined && !cascadeModule)
        requestCascade();
      else if (engine === "css-highlights") {
        paintedEngine = "css-highlights";
        return paintCssHighlights(code, language);
      }
      paintedEngine = "dom";
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
    /**
     * Sets the theme that "css-highlights" ranges resolve their colors
     * from. Clears the ranges when it changes; the next paint redraws them.
     * @param {Theme | undefined} next
     * @returns {boolean} Whether the theme changed.
     */
    setTheme(next) {
      if (next === theme) return false;
      theme = next;
      cascade = undefined;
      runTable = { styles: [], names: new Map() };
      removeStyle();
      clearHighlights();
      return true;
    },
    /**
     * The engine the last paint drew with. `"dom"` while a themed
     * `"css-highlights"` paint waits for the resolver, or after its load
     * failed.
     * @returns {PaintEngine}
     */
    paintedEngine() {
      return paintedEngine;
    },
    /** Removes this editor's CSS highlights. */
    clearHighlights,
    /** Removes this editor's CSS highlights and their `<style>`. */
    destroy() {
      destroyed = true;
      clearHighlights();
      removeStyle();
    },
  };
}
