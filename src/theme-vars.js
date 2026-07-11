/**
 * Shared `--shl-*` var-name derivation. Used by both the theme build
 * pipeline (`scripts/build-themes.ts`, via `scripts/utils/theme-ir.ts`) and
 * the runtime theme-authoring API (`src/theme.js`, `src/textmate-theme.js`)
 * so the two can never derive different var names for the same scope.
 */

const SHL_PREFIX = "--shl-";

/** CSS property -> `--shl-*` name suffix. `""` means no suffix (color is
 * the dominant, unsuffixed case). Only these properties fit the var
 * contract.
 * @type {Record<string, string>} */
export const PROP_SUFFIX = {
  color: "",
  "background-color": "bg",
  "font-style": "font-style",
  "font-weight": "font-weight",
  "text-decoration": "text-decoration",
};

export const SUPPORTED_PROPERTIES = new Set(Object.keys(PROP_SUFFIX));

/**
 * `null` when `property` isn't part of the var contract.
 * @param {string[]} scopes
 * @param {string} property
 * @returns {string | null}
 */
export function varName(scopes, property) {
  const suffix = PROP_SUFFIX[property];
  if (suffix === undefined) return null;
  if (scopes.length === 0) {
    const base = suffix === "" ? "fg" : suffix === "bg" ? "bg" : suffix;
    return `${SHL_PREFIX}${base}`;
  }
  const joined = scopes.join("-");
  return `${SHL_PREFIX}${suffix === "" ? joined : `${joined}-${suffix}`}`;
}

const HAS_WHITESPACE = /\s/;
const WHITESPACE_RUN = /\s+/;

/**
 * Parse a raw `ThemeDefinition["scopes"]` key ("keyword", "title.class_",
 * "meta keyword") into the ordered scope segments `varName` expects — the
 * same grouping a `.hljs-*` selector would classify into, just spelled
 * without the `.hljs-` prefix and CSS combinators.
 * @param {string} key
 * @returns {string[]}
 */
export function parseScopeKey(key) {
  const trimmed = key.trim();
  if (HAS_WHITESPACE.test(trimmed)) return trimmed.split(WHITESPACE_RUN);
  return trimmed.split(".");
}

/** @type {Record<string, [number, number, number]>} */
const NAMED_COLORS = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  gold: [255, 215, 0],
  navy: [0, 0, 128],
};

const HEX3 = /^#([0-9a-f]{3})$/;
const HEX6 = /^#([0-9a-f]{6})[0-9a-f]{0,2}$/;
const RGB_FUNCTION = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/;

/** Best-effort color parse for `colorScheme` inference; not a general CSS
 * color parser (hex + rgb()/rgba() + the handful of named colors themes
 * actually use are all that's needed here).
 * @param {string} value
 * @returns {[number, number, number] | null}
 */
export function parseColorToRgb(value) {
  const v = value.trim().toLowerCase();
  const named = NAMED_COLORS[v];
  if (named) return named;

  const hex3 = HEX3.exec(v);
  if (hex3?.[1]) {
    const digits = hex3[1];
    return /** @type {[number, number, number]} */ (
      [0, 1, 2].map((i) => {
        const ch = /** @type {string} */ (digits[i]);
        return Number.parseInt(ch + ch, 16);
      })
    );
  }

  const hex6 = HEX6.exec(v);
  if (hex6?.[1]) {
    const hex = hex6[1];
    return /** @type {[number, number, number]} */ (
      [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
    );
  }

  const rgb = RGB_FUNCTION.exec(v);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return null;
}

/** Falls back to `"light"` when `bgValue` is missing or unparseable — a
 * theme whose background never resolved to a var (e.g. a gradient) still
 * needs *some* metadata value.
 * @param {string | undefined} bgValue
 * @returns {"light" | "dark"}
 */
export function colorSchemeFor(bgValue) {
  const rgb = bgValue ? parseColorToRgb(bgValue) : null;
  if (!rgb) return "light";
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "light" : "dark";
}

/**
 * `ThemeRole` -> raw hljs scope keys it writes (the taste decision from
 * the theme-authoring design — see the role table in the theme-authoring
 * spec). `foreground` and `background` target the base `.hljs` scope
 * directly and are handled separately by callers. Exported so
 * `defineTheme`'s role expansion and the role-map validation report (see
 * `tests/theme-role-map-fidelity.test.ts`) can never drift apart.
 * @type {Record<string, string[]>}
 */
export const ROLE_SCOPES = {
  comment: ["comment", "quote"],
  keyword: ["keyword", "doctag", "formula", "template-tag", "meta keyword"],
  string: ["string", "regexp", "meta string"],
  literal: ["literal", "number", "symbol", "bullet"],
  function: ["title", "title.function_"],
  type: ["type", "title.class_", "built_in", "class title"],
  variable: [
    "variable",
    "template-variable",
    "variable.language_",
    "variable.constant_",
    "params",
  ],
  property: [
    "attr",
    "attribute",
    "property",
    "selector-attr",
    "selector-class",
    "selector-id",
    "selector-pseudo",
  ],
  tag: ["tag", "name", "selector-tag", "section"],
  punctuation: ["punctuation", "operator", "subst"],
  meta: ["meta", "meta.prompt_"],
  addition: ["addition"],
  deletion: ["deletion"],
};

/** `TokenStyle` field -> CSS property in the `--shl-*` var contract. Shared
 * between `defineTheme`'s role/scope expansion and the TextMate importer so
 * both write vars the same way. */
export const TOKEN_STYLE_FIELD_TO_PROPERTY = {
  color: "color",
  background: "background-color",
  fontStyle: "font-style",
  fontWeight: "font-weight",
  textDecoration: "text-decoration",
};

/**
 * Write every set field of one `TokenStyle` into `vars`, for the given
 * scope segments.
 * @param {Record<string, string>} vars
 * @param {string[]} scopes
 * @param {import("./theme.d.ts").TokenStyle} style
 */
export function applyTokenStyle(vars, scopes, style) {
  for (const [field, property] of Object.entries(
    TOKEN_STYLE_FIELD_TO_PROPERTY,
  )) {
    const value =
      style[/** @type {keyof import("./theme.d.ts").TokenStyle} */ (field)];
    if (value === undefined) continue;
    const vn = varName(scopes, property);
    if (vn) vars[vn] = value;
  }
}

/**
 * `key:value;key2:value2` — vars sorted alphabetically. The same
 * serialization the build uses for the generated `themes/<name>.css`
 * artifacts, shared so `paletteToCss` output matches byte-for-byte.
 * @param {Record<string, string> | Map<string, string>} vars
 * @returns {string}
 */
export function serializeVars(vars) {
  const entries =
    vars instanceof Map ? [...vars.entries()] : Object.entries(vars);
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
