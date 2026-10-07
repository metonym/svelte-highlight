// Inline CSS var strings for HighlightStyle's palette-object path.

import { PROP_SUFFIX } from "./theme-vars.js";
import { SHL_FALLBACKS } from "./themes/_shl-fallbacks.js";

const NON_COLOR_SUFFIXES = Object.values(PROP_SUFFIX)
  .filter((suffix) => suffix !== "")
  .map((suffix) => `-${suffix}`);

/** @param {string} key */
function isColorKey(key) {
  return !NON_COLOR_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Mirrors `themes/base.css`: key, then its `fallbacks` key, then (for color
 * keys) `--shl-fg`.
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
 * `light-dark()` per key; keys unresolved on either side are omitted since
 * `light-dark()` needs two concrete values.
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

/**
 * `color-scheme` makes native controls/scrollbars follow the theme.
 * @param {import("./theme.d.ts").ThemePalette} palette
 */
export function paletteStyle(palette) {
  return `${varsToStyle(palette.vars)};color-scheme:${palette.colorScheme}`;
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
 * Light-side values only, for browsers without `light-dark()`.
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
 * `<style>` overriding `lightFallbackStyle`'s inline baseline with the
 * `light-dark()` merge where supported.
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
