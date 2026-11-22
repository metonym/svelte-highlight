/**
 * Which engine paints, shared by Highlight and HighlightEditable. The
 * painting itself is in `css-highlights-paint.js`, so a component on the
 * "dom" engine can load it only when it's needed. Framework-free.
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
