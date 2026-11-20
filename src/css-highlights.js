/**
 * The `"css-highlights"` engine's DOM side, shared by Highlight and
 * HighlightEditable: feature detection, one component's scope ->
 * `Highlight` registrations on `CSS.highlights`, and painting token ranges
 * over text nodes. The `::highlight()` rules come from
 * `highlight-theme.js`. Framework-free.
 */

/** @typedef {"dom" | "css-highlights"} PaintEngine */

/** True when this runtime supports the CSS Custom Highlight API. */
export function supportsCssHighlights() {
  return typeof CSS !== "undefined" && typeof CSS.highlights !== "undefined";
}

/**
 * The engine to use for a requested one: "css-highlights" falls back to
 * "dom" where `CSS.highlights` is missing (SSR, older browsers).
 * @param {PaintEngine} engine
 * @returns {PaintEngine}
 */
export function resolveEngine(engine) {
  return engine === "css-highlights" && supportsCssHighlights()
    ? "css-highlights"
    : "dom";
}

/**
 * One `Highlight` per scope, registered lazily as `${prefix}-${scope}`.
 * @param {string} prefix Unique per component instance, e.g. `hljs-3`.
 */
export function createScopeHighlights(prefix) {
  /** @type {Map<string, Highlight>} */
  let highlights = new Map();

  return {
    /**
     * @param {string} scope
     * @param {Range} range
     */
    add(scope, range) {
      let highlight = highlights.get(scope);
      if (!highlight) {
        highlight = new Highlight();
        highlights.set(scope, highlight);
        CSS.highlights.set(`${prefix}-${scope}`, highlight);
      }
      highlight.add(range);
    },

    /**
     * @param {string} scope
     * @param {Range} range
     */
    delete(scope, range) {
      highlights.get(scope)?.delete(range);
    },

    /** Unregisters every scope. */
    clear() {
      for (const scope of highlights.keys()) {
        CSS.highlights.delete(`${prefix}-${scope}`);
      }
      highlights = new Map();
    },
  };
}

/**
 * Adds one range per token over the text nodes under `root`, in document
 * order. `tokenRanges` are offsets into `root.textContent`, sorted and
 * disjoint, as `toRanges` returns them. A token split across text nodes
 * gets a range in each.
 * @param {ReturnType<typeof createScopeHighlights>} highlights
 * @param {Element} root
 * @param {import("./engine.d.ts").TokenRange[]} tokenRanges
 */
export function paintTokenRanges(highlights, root, tokenRanges) {
  const doc = /** @type {Document} */ (root.ownerDocument);
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let tokenIndex = 0;
  let nodeStart = 0;
  for (
    let node = walker.nextNode();
    node && tokenIndex < tokenRanges.length;
    node = walker.nextNode()
  ) {
    const text = /** @type {Text} */ (node);
    const nodeEnd = nodeStart + text.length;
    while (
      tokenIndex < tokenRanges.length &&
      /** @type {{ end: number }} */ (tokenRanges[tokenIndex]).end <= nodeStart
    ) {
      tokenIndex++;
    }
    for (
      let j = tokenIndex;
      j < tokenRanges.length &&
      /** @type {{ start: number }} */ (tokenRanges[j]).start < nodeEnd;
      j++
    ) {
      const token = /** @type {(typeof tokenRanges)[number]} */ (
        tokenRanges[j]
      );
      const start = Math.max(token.start, nodeStart) - nodeStart;
      const end = Math.min(token.end, nodeEnd) - nodeStart;
      if (start === end) continue;
      const range = new Range();
      range.setStart(text, start);
      range.setEnd(text, end);
      highlights.add(token.scope, range);
    }
    nodeStart = nodeEnd;
  }
}
