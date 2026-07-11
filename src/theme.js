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
  parseScopeKey,
  ROLE_SCOPES,
  serializeVars,
  varName,
} from "./theme-vars.js";

const DEFAULT_NAME = "custom-theme";

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
