// The "css-highlights" engine as a plain function: paints an element's
// text with the CSS Custom Highlight API, no `<span>` per token.

import { supportsCssHighlights } from "./css-highlights.js";
import {
  createScopeHighlights,
  paintTokenRanges,
} from "./css-highlights-paint.js";
import { renderHtml } from "./engine.js";
import {
  cascadeHighlightRules,
  cascadeRanges,
  createThemeCascade,
} from "./highlight-cascade.js";
import { ensureRegistered, registry } from "./registry.js";

/** @typedef {import("./dom.d.ts").PaintHighlightsOptions} PaintHighlightsOptions */
/** @typedef {import("./dom.d.ts").PaintHighlightsHandle} PaintHighlightsHandle */

let instanceCount = 0;

/**
 * Highlights `element`'s code in place. With a `theme` and the CSS Custom
 * Highlight API, the text stays a single text node and the browser paints
 * each token. Otherwise it renders `<span>`s, as the `highlight` action
 * does, for the page's theme CSS to color.
 * @param {HTMLElement} element
 * @param {PaintHighlightsOptions} options
 * @returns {PaintHighlightsHandle}
 */
export function paintHighlights(element, options) {
  const prefix = `hljs-paint-${++instanceCount}`;
  const originalText = element.textContent ?? "";
  const highlights = supportsCssHighlights()
    ? createScopeHighlights(prefix)
    : undefined;
  /** @type {HTMLStyleElement | undefined} */
  let styleElement;
  /** @type {PaintHighlightsOptions["theme"]} */
  let cascadeTheme;
  /** @type {import("./highlight-cascade.js").ThemeCascade | undefined} */
  let cascade;
  let current = options;
  /** @type {"dom" | "css-highlights"} */
  let engine = "dom";

  /** The color the `<pre>` inherits, for themes that use `currentColor`. */
  function outsideColor() {
    const outside = element.closest("pre")?.parentElement;
    return outside ? getComputedStyle(outside).color : null;
  }

  /** @param {string} rules */
  function setStyle(rules) {
    if (!styleElement) {
      const doc = /** @type {Document} */ (element.ownerDocument);
      const root = element.getRootNode();
      styleElement = doc.createElement("style");
      // In a shadow root, rules in the document head don't apply.
      const parent =
        root.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in root
          ? /** @type {ShadowRoot} */ (root)
          : doc.head;
      parent.append(styleElement);
    }
    styleElement.textContent = rules;
  }

  function clearPaint() {
    highlights?.clear();
    styleElement?.remove();
    styleElement = undefined;
  }

  function render() {
    const { language, theme } = current;
    const code = String(current.code ?? originalText);
    ensureRegistered(language);
    const { events } = registry.highlight(code, { language: language.name });
    element.classList.add("hljs");

    if (!highlights || theme === undefined) {
      clearPaint();
      element.innerHTML = renderHtml(events);
      engine = "dom";
      return;
    }
    if (cascade === undefined || theme !== cascadeTheme) {
      cascadeTheme = theme;
      cascade = createThemeCascade(theme, outsideColor);
    }
    const { ranges, styles } = cascadeRanges(events, cascade);
    element.textContent = code;
    highlights.clear();
    paintTokenRanges(highlights, element, ranges);
    setStyle(cascadeHighlightRules(styles, prefix));
    engine = "css-highlights";
  }

  render();

  return {
    get engine() {
      return engine;
    },
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      clearPaint();
      element.classList.remove("hljs");
      element.textContent = originalText;
    },
  };
}
