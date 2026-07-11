/**
 * Pure helpers turning `ThemePalette` objects into inline CSS var strings
 * for `HighlightStyle`'s object path (see `HighlightStyle.svelte`).
 */

import { SHL_FALLBACKS } from "./themes/_shl-fallbacks.js";

const NON_COLOR_SUFFIXES = [
  "-bg",
  "-font-style",
  "-font-weight",
  "-text-decoration",
];

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

/** @param {Record<string, string>} vars */
export function varsToStyle(vars) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
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
