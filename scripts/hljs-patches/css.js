import base from "highlight.js/lib/languages/css";

/**
 * Patches for highlight.js's CSS grammar.
 *
 * - Adds properties that ship in at least one major browser but were
 *   missing from the stock property list. Before, a name like
 *   `position-area` was styled only up to `position`, and a name like
 *   `interpolate-size` was left plain.
 *
 * Only `css` is patched. `scss`, `less`, and `stylus` carry their own copy
 * of the property list. `svelte`, `vue`, and `astro` style blocks embed
 * `css` by name, so they pick up this patch at runtime.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  const contains = /** @type {any[]} */ (lang.contains);
  const attribute = contains.find(
    (mode) =>
      mode.className === "attribute" &&
      typeof mode.begin === "string" &&
      mode.begin.includes("|align-content|"),
  );
  if (!attribute) throw new Error("css patch: attribute mode not found");

  const match = /^\\b\((.*)\)\\b$/.exec(attribute.begin);
  if (!match?.[1]) throw new Error("css patch: attribute pattern changed");
  const names = new Set(match[1].split("|"));
  const added = [
    // Anchor positioning
    "anchor-scope",
    "position-area",
    "position-try",
    "position-try-fallbacks",
    "position-try-order",
    // Sizing and layout
    "interpolate-size",
    "reading-flow",
    "reading-order",
    // Text
    "font-width",
    "text-autospace",
    "text-box",
    "text-box-edge",
    "text-box-trim",
    "text-spacing-trim",
    // Scrolling
    "scroll-initial-target",
    "scroll-marker-group",
    "scroll-target-group",
    // Other
    "caret-animation",
    "dynamic-range-limit",
    "object-view-box",
    "view-transition-class",
  ].filter((name) => !names.has(name));
  if (added.length === 0) throw new Error("css patch: nothing left to add");

  // Sort, then reverse, like the stock list, so a longer name such as
  // `position-area` is tried before `position`.
  const all = [...names, ...added].sort().reverse();
  contains[contains.indexOf(attribute)] = {
    ...attribute,
    begin: `\\b(${all.join("|")})\\b`,
  };

  return lang;
}

export const css = { name: "css", register };
export default css;
