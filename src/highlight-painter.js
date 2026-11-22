// `Highlight`'s "css-highlights" painting. `Highlight` imports it on the
// first paint, so pages on the "dom" engine don't bundle it.

import {
  createScopeHighlights,
  paintTokenRanges,
} from "./css-highlights-paint.js";
import {
  cascadeHighlightStyle,
  cascadeRanges,
  createThemeCascade,
} from "./highlight-cascade.js";

/**
 * Paints one `Highlight`'s tokens as CSS highlights named `prefix-c<i>`.
 * @param {string} prefix Unique per instance, e.g. `hljs-highlight-1`.
 * @param {() => string | null} outsideColor The color around the `<pre>`.
 */
export function createHighlightPainter(prefix, outsideColor) {
  const highlights = createScopeHighlights(prefix);
  let themed = false;
  /** @type {string | import("./theme.d.ts").ThemePalette | undefined} */
  let theme;
  /** @type {import("./highlight-cascade.js").ThemeCascade | undefined} */
  let cascade;
  /** @type {import("./engine.d.ts").ScopeEvent[] | undefined} */
  let events;
  /** @type {ReturnType<typeof cascadeRanges> | undefined} */
  let runs;
  let style = "";
  /** @type {{ runs: ReturnType<typeof cascadeRanges>; code: Element; text: ChildNode | null } | undefined} */
  let painted;

  function clear() {
    if (!painted) return;
    highlights.clear();
    painted = undefined;
  }

  return {
    /**
     * The `::highlight()` rules for `nextEvents` under `nextTheme`, as a
     * `<style>`; `""` without a theme.
     * @param {import("./engine.d.ts").ScopeEvent[]} nextEvents
     * @param {string | import("./theme.d.ts").ThemePalette | undefined} nextTheme
     */
    update(nextEvents, nextTheme) {
      if (!themed || nextTheme !== theme) {
        themed = true;
        theme = nextTheme;
        cascade =
          theme === undefined
            ? undefined
            : createThemeCascade(theme, outsideColor);
        events = undefined;
      }
      if (nextEvents !== events) {
        events = nextEvents;
        runs = cascade ? cascadeRanges(events, cascade) : undefined;
        style = runs ? cascadeHighlightStyle(runs.styles, prefix) : "";
      }
      return style;
    },

    /**
     * Paints the runs from the last `update` over `code`'s text, unless
     * they're already painted there. Clears them without runs.
     * @param {Element | undefined} code
     */
    paint(code) {
      if (!code || !runs) {
        clear();
        return;
      }
      const text = code.firstChild;
      if (
        painted?.runs === runs &&
        painted.code === code &&
        painted.text === text
      ) {
        return;
      }
      highlights.clear();
      paintTokenRanges(highlights, code, runs.ranges);
      painted = { runs, code, text };
    },

    clear,
  };
}
