// Theme styles resolved per token, for targets with no CSS: terminals,
// canvas, PDF, images, native views. Colors and fonts come from the same
// cascade the "css-highlights" engine uses, so they match what the theme's
// CSS paints for the "dom" engine's `<span>` markup.

import { CLOSE, OPEN } from "./engine.js";
import { createThemeCascade } from "./highlight-cascade.js";

/**
 * @typedef {import("./styled-tokens.d.ts").StyledToken} StyledToken
 * @typedef {import("./styled-tokens.d.ts").TokenStyler} TokenStyler
 * @typedef {import("./styled-tokens.d.ts").StyledLines} StyledLines
 * @typedef {import("./highlight-cascade.js").ThemeCascade} ThemeCascade
 * @typedef {import("./highlight-cascade.js").TokenStyle} TokenStyle
 */

/**
 * @param {string | import("./theme.d.ts").ThemePalette} theme Theme CSS (a
 *   `svelte-highlight/styles/*` string, with or without `<style>`) or a
 *   `ThemePalette`.
 * @param {{ color?: string }} [options] `color` stands in for the page's
 *   text color, for themes that leave `.hljs` uncolored or use
 *   `currentColor`.
 * @returns {TokenStyler}
 */
export function createTokenStyler(theme, { color } = {}) {
  const cascade = createThemeCascade(
    theme,
    color === undefined ? undefined : () => color,
    { fonts: true },
  );
  const root = cascade.tokenStyleOf(cascade.root);
  const foreground = cascade.root.color ?? color;
  const background = cascade.root.background ?? undefined;
  return {
    ...(foreground !== undefined && { foreground }),
    ...(background !== undefined && { background }),
    lines: (events) => styleLines(events, cascade, root, color),
  };
}

/**
 * One-off `createTokenStyler(theme, options).lines(events)`, plus the
 * theme's `foreground` and `background`.
 * @param {import("./engine.d.ts").ScopeEvent[]} events
 * @param {string | import("./theme.d.ts").ThemePalette} theme
 * @param {{ color?: string }} [options]
 * @returns {StyledLines}
 */
export function styleTokens(events, theme, options) {
  const { lines, ...colors } = createTokenStyler(theme, options);
  return { ...colors, lines: lines(events) };
}

/**
 * Splits only on LF, like `tokenLines`: a trailing newline (or empty
 * input) yields a trailing empty line.
 * @param {import("./engine.d.ts").ScopeEvent[]} events
 * @param {ThemeCascade} cascade
 * @param {TokenStyle} rootStyle
 * @param {string | undefined} color
 * @returns {StyledToken[][]}
 */
function styleLines(events, cascade, rootStyle, color) {
  /** @type {StyledToken[][]} */
  const lines = [];
  /** @type {StyledToken[]} */
  let line = [];
  /** @type {string[]} */
  const scopeStack = [];
  const nodes = [cascade.root];
  let node = cascade.root;
  // Recomputed only on OPEN/CLOSE, so same-level text merges by identity.
  /** @type {string[]} */
  let scopes = [];
  let style = withColor(rootStyle, color);
  /** @type {StyledToken | null} */
  let last = null;

  /** @param {string} text */
  const push = (text) => {
    if (text === "") return;
    if (last !== null && last.scopes === scopes) {
      last.text += text;
      return;
    }
    last = { text, scopes, ...style };
    line.push(last);
  };

  for (const event of events) {
    if (event.t === OPEN) {
      scopeStack.push(event.s);
      node = cascade.child(node, event.s);
      nodes.push(node);
    } else if (event.t === CLOSE) {
      scopeStack.pop();
      nodes.pop();
      node = /** @type {typeof node} */ (nodes[nodes.length - 1]);
    } else {
      const text = event.v;
      let start = 0;
      for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10) {
          push(text.slice(start, i));
          lines.push(line);
          line = [];
          last = null;
          start = i + 1;
        }
      }
      push(text.slice(start));
      continue;
    }
    scopes = scopeStack.slice();
    style = withColor(cascade.tokenStyleOf(node), color);
  }
  lines.push(line);
  return lines;
}

/**
 * Fills in `color` for text the theme leaves uncolored.
 * @param {TokenStyle} style
 * @param {string | undefined} color
 * @returns {TokenStyle}
 */
function withColor(style, color) {
  return style.color === undefined && color !== undefined
    ? { color, ...style }
    : style;
}
