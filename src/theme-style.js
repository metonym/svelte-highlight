// Inline CSS var strings for HighlightStyle's palette-object path.

import { PROP_SUFFIX } from "./theme-vars.js";
import { SHL_FALLBACKS } from "./themes/_shl-fallbacks.js";

const NON_COLOR_SUFFIXES = Object.values(PROP_SUFFIX)
  .filter((suffix) => suffix !== "")
  .map((suffix) => `-${suffix}`);

/** Keys for `font-style`, `font-weight` and `text-decoration`. */
const FONT_SUFFIXES = NON_COLOR_SUFFIXES.filter(
  (suffix) => suffix !== `-${PROP_SUFFIX["background-color"]}`,
);

/** @param {string} key */
function isColorKey(key) {
  return !NON_COLOR_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * `light-dark()` only takes colors, so `font-style`, `font-weight` and
 * `text-decoration` keys switch some other way.
 * @param {string} key
 */
function isFontKey(key) {
  return FONT_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Mirrors `themes/base.css`: key, then each `fallbacks` key in turn, then
 * (for color keys) `--shl-fg`.
 * @param {Record<string, string>} vars
 * @param {string} key
 * @param {Record<string, string>} fallbacks
 * @returns {string | undefined}
 */
export function resolveThemeVar(vars, key, fallbacks) {
  for (
    let current = /** @type {string | undefined} */ (key), hops = 0;
    current !== undefined && hops < 8;
    current = fallbacks[current], hops++
  ) {
    if (vars[current] !== undefined) return vars[current];
  }
  if (isColorKey(key) && vars["--shl-fg"] !== undefined)
    return vars["--shl-fg"];
  return undefined;
}

/**
 * `light-dark()` per color key. A background one side doesn't set is
 * `transparent` there; other keys unresolved on either side are omitted,
 * since `light-dark()` needs two colors. Font keys are left to
 * {@link darkFontVars}.
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
    if (isFontKey(key)) continue;
    const unset = isColorKey(key) ? undefined : "transparent";
    const lightValue = resolveThemeVar(lightVars, key, fallbacks) ?? unset;
    const darkValue = resolveThemeVar(darkVars, key, fallbacks) ?? unset;
    if (lightValue === undefined || darkValue === undefined) continue;
    merged[key] = `light-dark(${lightValue}, ${darkValue})`;
  }
  return merged;
}

/**
 * The font keys whose dark value differs from the light one, for dark mode
 * to override `lightFallbackStyle`'s light values with. A key the dark side
 * doesn't set is `initial`, so `base.css` falls back as it would without
 * the light theme.
 * @param {Record<string, string>} lightVars
 * @param {Record<string, string>} darkVars
 * @param {Record<string, string>} fallbacks
 * @returns {Record<string, string>}
 */
export function darkFontVars(lightVars, darkVars, fallbacks) {
  const keys = new Set([...Object.keys(lightVars), ...Object.keys(darkVars)]);
  /** @type {Record<string, string>} */
  const vars = {};
  for (const key of keys) {
    if (!isFontKey(key)) continue;
    const lightValue = resolveThemeVar(lightVars, key, fallbacks);
    const darkValue = resolveThemeVar(darkVars, key, fallbacks) ?? "initial";
    if (darkValue !== lightValue) vars[key] = darkValue;
  }
  return vars;
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
  return `${openTag}@supports (color: light-dark(#000, #000)){.${scopeClass}{${decls}}${darkFontRule(scopeClass, light, dark, mode)}}</style>`;
}

/**
 * The dark palette's font keys, under the same condition `light-dark()`
 * picks the dark color: the media query for `"auto"`, always for
 * `"dark"`, never for `"light"`, and under the selector otherwise.
 * @param {string} scopeClass
 * @param {import("./theme.d.ts").ThemePalette} light
 * @param {import("./theme.d.ts").ThemePalette} dark
 * @param {string} mode
 * @returns {string}
 */
function darkFontRule(scopeClass, light, dark, mode) {
  if (mode === "light") return "";
  const vars = darkFontVars(light.vars, dark.vars, SHL_FALLBACKS);
  if (Object.keys(vars).length === 0) return "";
  const decls = varsToStyle(vars, { important: true });
  if (mode === "dark") return `.${scopeClass}{${decls}}`;
  if (mode === "auto") {
    return `@media (prefers-color-scheme: dark){.${scopeClass}{${decls}}}`;
  }
  return `${mode} .${scopeClass}{${decls}}`;
}
