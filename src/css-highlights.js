/**
 * Shared CSS Custom Highlight API painter, extracted from
 * `HighlightEditable`'s experimental "css-highlights" engine so `Highlight`
 * can offer the same rendering: plain text nodes plus `Range` objects
 * registered on `CSS.highlights`, themed via generated `::highlight()`
 * rules, instead of one `<span>` per token.
 */

import {
  highlightRules,
  highlightRulesFromPalette,
} from "./highlight-theme.js";

/**
 * `"css-highlights"` when requested AND `CSS.highlights` is available;
 * `"dom"` otherwise (unsupported browser, or SSR where `CSS` doesn't exist).
 * @param {string} requested
 * @returns {"dom" | "css-highlights"}
 */
export function resolveEngine(requested) {
  return requested === "css-highlights" &&
    typeof CSS !== "undefined" &&
    typeof CSS.highlights !== "undefined"
    ? "css-highlights"
    : "dom";
}

let instanceCount = 0;

/** Monotonic per-page instance ids, used to namespace `::highlight()` names. */
export function nextInstanceId() {
  return ++instanceCount;
}

/**
 * Instance-scoped `::highlight()` rules for a theme string or `ThemePalette`:
 * converts via `highlightRulesFromPalette`/`highlightRules`, then renames
 * every `::highlight(hljs-` to `::highlight(hljs-<instanceId>-` so multiple
 * instances on the same page don't collide.
 * @param {string | import("./theme.d.ts").ThemePalette} theme
 * @param {number} instanceId
 * @returns {string}
 */
export function instanceHighlightRules(theme, instanceId) {
  const rules =
    typeof theme === "object"
      ? highlightRulesFromPalette(theme)
      : highlightRules(theme);
  return rules.replaceAll(
    "::highlight(hljs-",
    `::highlight(hljs-${instanceId}-`,
  );
}

/**
 * Scope -> `Highlight` registry for one component instance.
 * @param {number} instanceId
 */
export function createHighlightPainter(instanceId) {
  /** @type {Map<string, Highlight>} */
  let highlights = new Map();

  /**
   * Lazily creates the `Highlight` for `scope` and registers it as
   * `hljs-<instanceId>-<scope>`.
   * @param {string} scope
   * @returns {Highlight}
   */
  function highlightFor(scope) {
    let highlight = highlights.get(scope);
    if (!highlight) {
      highlight = new Highlight();
      highlights.set(scope, highlight);
      CSS.highlights.set(`hljs-${instanceId}-${scope}`, highlight);
    }
    return highlight;
  }

  /**
   * Registers ranges for token ranges intersecting
   * `[textOffset, textOffset + textLength)` of `textNode`'s text, with
   * `tokenRanges` given as absolute document offsets.
   * @param {Text} textNode
   * @param {import("./engine.d.ts").TokenRange[]} tokenRanges
   * @param {number} textOffset
   * @param {number} textLength
   * @returns {Array<{ scope: string; range: Range }>}
   */
  function paintNode(textNode, tokenRanges, textOffset, textLength) {
    const windowEnd = textOffset + textLength;
    const created = [];
    for (const token of tokenRanges) {
      if (token.end <= textOffset || token.start >= windowEnd) continue;
      const start = Math.max(token.start, textOffset) - textOffset;
      const end = Math.min(token.end, windowEnd) - textOffset;
      if (start === end) continue;
      const range = new Range();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      highlightFor(token.scope).add(range);
      created.push({ scope: token.scope, range });
    }
    return created;
  }

  /** Deletes all `CSS.highlights` registrations for this instance. */
  function clear() {
    for (const scope of highlights.keys()) {
      CSS.highlights.delete(`hljs-${instanceId}-${scope}`);
    }
    highlights = new Map();
  }

  return { highlightFor, paintNode, clear };
}
