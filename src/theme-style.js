/**
 * Pure helpers turning `ThemePalette` objects into inline CSS var strings
 * for `HighlightStyle`'s object path (see `HighlightStyle.svelte`).
 */

import { PROP_SUFFIX } from "./theme-vars.js";
import { SHL_FALLBACKS } from "./themes/_shl-fallbacks.js";

// `-bg`, `-font-style`, ...: every var suffix except color's empty one.
const NON_COLOR_SUFFIXES = Object.values(PROP_SUFFIX)
  .filter((suffix) => suffix !== "")
  .map((suffix) => `-${suffix}`);

/** @param {string} key */
function isColorKey(key) {
  return !NON_COLOR_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Resolve one palette's value for `key`, falling back through the same
 * chain `themes/base.css` encodes when the palette never set it directly:
 * a multi-scope key falls back to its subject-scope key (per `fallbacks`),
 * and a still-unresolved color key falls back to `--shl-fg`.
 * @param {Record<string, string>} vars
 * @param {string} key
 * @param {Record<string, string>} fallbacks
 * @returns {string | undefined}
 */
export function resolveThemeVar(vars, key, fallbacks) {
  if (vars[key] !== undefined) return vars[key];
  const fallbackKey = fallbacks[key];
  if (fallbackKey !== undefined && vars[fallbackKey] !== undefined) {
    return vars[fallbackKey];
  }
  if (isColorKey(key) && vars["--shl-fg"] !== undefined)
    return vars["--shl-fg"];
  return undefined;
}

/**
 * `--shl-x: light-dark(<light>, <dark>)` for every key in the union of
 * both palettes' vars. A key that still can't be resolved on one side
 * after fallback is omitted entirely — `light-dark()` requires two
 * concrete arguments, so a missing side must never produce an empty or
 * invalid one.
 * @param {Record<string, string>} lightVars
 * @param {Record<string, string>} darkVars
 * @param {Record<string, string>} fallbacks
 * @returns {Record<string, string>}
 */
export function mergeLightDarkVars(lightVars, darkVars, fallbacks) {
  const keys = new Set([...Object.keys(lightVars), ...Object.keys(darkVars)]);
  /** @type {Record<string, string>} */
  const merged = {};
  for (const key of keys) {
    const lightValue = resolveThemeVar(lightVars, key, fallbacks);
    const darkValue = resolveThemeVar(darkVars, key, fallbacks);
    if (lightValue === undefined || darkValue === undefined) continue;
    merged[key] = `light-dark(${lightValue}, ${darkValue})`;
  }
  return merged;
}

/**
 * @param {Record<string, string>} vars
 * @param {{ important?: boolean }} [options]
 */
export function varsToStyle(vars, { important = false } = {}) {
  const suffix = important ? " !important" : "";
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}${suffix}`)
    .join(";");
}

/** @type {Record<string, string>} */
const COLOR_SCHEME_BY_MODE = {
  auto: "light dark",
  light: "light",
  dark: "dark",
};

/** @param {import("./theme.d.ts").ThemePalette} palette */
export function paletteStyle(palette) {
  return varsToStyle(palette.vars);
}

/**
 * @param {import("./theme.d.ts").ThemePalette} light
 * @param {import("./theme.d.ts").ThemePalette} dark
 * @param {string} mode
 */
export function dualPaletteStyle(light, dark, mode) {
  const merged = mergeLightDarkVars(light.vars, dark.vars, SHL_FALLBACKS);
  const varsStyle = varsToStyle(merged);
  const colorScheme = COLOR_SCHEME_BY_MODE[mode];
  return colorScheme ? `${varsStyle};color-scheme:${colorScheme}` : varsStyle;
}

/**
 * Plain-declaration baseline for a light/dark palette pair: the light
 * side's resolved value for every key either palette declares, with no
 * `light-dark()` — safe on any browser, including ones that don't support
 * it. A key resolvable only via the dark side is omitted, same as
 * `mergeLightDarkVars`.
 * @param {import("./theme.d.ts").ThemePalette} light
 * @param {import("./theme.d.ts").ThemePalette} dark
 * @returns {string}
 */
export function lightFallbackStyle(light, dark) {
  const keys = new Set([...Object.keys(light.vars), ...Object.keys(dark.vars)]);
  /** @type {Record<string, string>} */
  const vars = {};
  for (const key of keys) {
    const value = resolveThemeVar(light.vars, key, SHL_FALLBACKS);
    if (value !== undefined) vars[key] = value;
  }
  return varsToStyle(vars);
}

/**
 * A scoped `<style>` tag, gated behind `@supports (color: light-dark(#000,
 * #000))`, that overrides `lightFallbackStyle`'s plain baseline with the
 * `light-dark()` merge (and `color-scheme`) on browsers that support it.
 * Paired with `lightFallbackStyle` as `HighlightStyle`'s inline style for a
 * light/dark palette pair.
 * @param {string} scopeClass
 * @param {import("./theme.d.ts").ThemePalette} light
 * @param {import("./theme.d.ts").ThemePalette} dark
 * @param {string} mode
 * @param {string} [nonce] CSP nonce for the `<style>` tag.
 * @returns {string}
 */
export function dualPaletteSupportsStyle(scopeClass, light, dark, mode, nonce) {
  const merged = mergeLightDarkVars(light.vars, dark.vars, SHL_FALLBACKS);
  const colorScheme = COLOR_SCHEME_BY_MODE[mode];
  if (colorScheme) merged["color-scheme"] = colorScheme;
  const decls = varsToStyle(merged, { important: true });
  const openTag = nonce ? `<style nonce="${nonce}">` : "<style>";
  return `${openTag}@supports (color: light-dark(#000, #000)){.${scopeClass}{${decls}}}</style>`;
}
