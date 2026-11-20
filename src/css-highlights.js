/**
 * The `"css-highlights"` engine's DOM side: feature detection, plus one
 * component's scope -> `Highlight` registrations on `CSS.highlights`. The
 * `::highlight()` rules come from `highlight-theme.js`. Framework-free.
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
