/**
 * Programmatic theme authoring on top of the `ThemePalette` format:
 * `defineTheme()` builds a complete palette from a small typed
 * `roles`/`scopes` definition, `extendTheme()` derives a palette from an
 * existing one, and `paletteToCss()` emits any palette as static CSS.
 *
 * @typedef {import("./theme.d.ts").ThemePalette} ThemePalette
 * @typedef {import("./theme.d.ts").ThemeDefinition} ThemeDefinition
 * @typedef {import("./theme.d.ts").TokenStyle} TokenStyle
 * @typedef {import("./theme.d.ts").PaletteToCssOptions} PaletteToCssOptions
 */

import {
  applyTokenStyle,
  colorSchemeFor,
  parseColorToRgb,
  parseScopeKey,
  ROLE_SCOPES,
  serializeVars,
  unknownScopeSegments,
  varName,
} from "./theme-vars.js";

const DEFAULT_NAME = "custom-theme";

const THEME_VAR_GRAMMAR = /^--shl-[\w-]+$/;
const CSS_KEYWORD_COLORS = new Set([
  "currentcolor",
  "transparent",
  "inherit",
  "initial",
  "unset",
  "revert",
]);

/**
 * @param {string | TokenStyle} value
 * @returns {TokenStyle}
 */
function normalizeStyle(value) {
  return typeof value === "string" ? { color: value } : value;
}

/**
 * Build a complete `ThemePalette` from a `ThemeDefinition`. Precedence
 * (low -> high): `extends` palette vars -> `roles` expansion -> `scopes`
 * overrides.
 * @param {ThemeDefinition} definition
 * @returns {ThemePalette}
 */
export function defineTheme(definition) {
  const roles = definition.roles ?? {};

  if (!definition.extends) {
    if (roles.foreground === undefined) {
      throw new Error(
        'defineTheme(): "roles.foreground" is required when no "extends" palette is given.',
      );
    }
    if (roles.background === undefined) {
      throw new Error(
        'defineTheme(): "roles.background" is required when no "extends" palette is given.',
      );
    }
  }

  /** @type {Record<string, string>} */
  const vars = definition.extends ? { ...definition.extends.vars } : {};

  for (const [role, rawValue] of Object.entries(roles)) {
    if (rawValue === undefined) continue;
    const style = normalizeStyle(rawValue);

    if (role === "foreground") {
      if (style.color !== undefined) {
        vars[/** @type {string} */ (varName([], "color"))] = style.color;
      }
      continue;
    }
    if (role === "background") {
      if (style.color !== undefined) {
        vars[/** @type {string} */ (varName([], "background-color"))] =
          style.color;
      }
      continue;
    }

    const scopeKeys = ROLE_SCOPES[role];
    if (!scopeKeys) continue;
    for (const scopeKey of scopeKeys) {
      applyTokenStyle(vars, parseScopeKey(scopeKey), style);
    }
  }

  for (const [scopeKey, rawValue] of Object.entries(definition.scopes ?? {})) {
    if (import.meta.env?.DEV) {
      const unknown = unknownScopeSegments(scopeKey);
      if (unknown.length > 0) {
        console.warn(
          `[svelte-highlight] defineTheme(): scope key "${scopeKey}" has unfamiliar segment(s): ${unknown.join(", ")}.`,
        );
      }
    }
    applyTokenStyle(vars, parseScopeKey(scopeKey), normalizeStyle(rawValue));
  }

  const colorScheme =
    definition.colorScheme ?? colorSchemeFor(vars["--shl-bg"]);

  /** @type {ThemePalette} */
  const palette = {
    name: definition.name ?? DEFAULT_NAME,
    colorScheme,
    vars,
  };
  if (definition.extends?.extras !== undefined) {
    palette.extras = definition.extends.extras;
  }

  if (import.meta.env?.DEV) {
    for (const message of validatePalette(palette)) {
      console.warn(`[svelte-highlight] defineTheme(): ${message}`);
    }
  }

  return palette;
}

/**
 * Derive a new palette from any shipped or user palette with role- or
 * scope-level overrides.
 * @param {ThemePalette} base
 * @param {Omit<ThemeDefinition, "extends">} overrides
 * @returns {ThemePalette}
 */
export function extendTheme(base, overrides) {
  return defineTheme({ ...overrides, extends: base });
}

/**
 * Emit a palette as a CSS string, matching the format of the generated
 * `themes/<name>.css` artifacts.
 * @param {ThemePalette} palette
 * @param {PaletteToCssOptions} [options]
 * @returns {string}
 */
export function paletteToCss(palette, options = {}) {
  const root = options.root ?? true;
  const selector = options.selector ?? `[data-shl-theme="${palette.name}"]`;
  const varsCss = serializeVars(palette.vars);

  let css = "";
  if (root) css += `:root{${varsCss}}`;
  css += `${selector}{${varsCss}}`;
  if (palette.extras) css += palette.extras;
  return css;
}

/**
 * Self-check a `ThemePalette` for common authoring mistakes: a missing or
 * malformed `vars` object, a missing `--shl-fg`/`--shl-bg`, a `vars` key
 * outside the `--shl-*` grammar, or a `--shl-fg`/`--shl-bg` value that
 * doesn't look like a recognized color. Never throws; `defineTheme` runs
 * this automatically in dev mode.
 * @param {ThemePalette} palette
 * @returns {string[]}
 */
export function validatePalette(palette) {
  /** @type {string[]} */
  const messages = [];
  const vars = palette?.vars;

  if (vars === null || typeof vars !== "object") {
    messages.push('"vars" is missing or not a plain object.');
    return messages;
  }

  if (vars["--shl-fg"] === undefined) {
    messages.push('"--shl-fg" (roles.foreground) is missing from "vars".');
  }
  if (vars["--shl-bg"] === undefined) {
    messages.push('"--shl-bg" (roles.background) is missing from "vars".');
  }

  for (const key of Object.keys(vars)) {
    if (!THEME_VAR_GRAMMAR.test(key)) {
      messages.push(`"${key}" does not match the --shl-* var grammar.`);
    }
  }

  for (const key of /** @type {const} */ (["--shl-fg", "--shl-bg"])) {
    const value = vars[key];
    if (!value) continue;
    if (
      parseColorToRgb(value) === null &&
      !value.includes("(") &&
      !CSS_KEYWORD_COLORS.has(value.toLowerCase())
    ) {
      messages.push(
        `"${key}" value "${value}" doesn't look like a recognized color.`,
      );
    }
  }

  return messages;
}
