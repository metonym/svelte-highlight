// `--shl-*` var naming shared by the theme build (scripts/) and the runtime
// theme APIs so both always derive the same names.

const SHL_PREFIX = "--shl-";

/** CSS property -> `--shl-*` name suffix (`""` for color).
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
  if (scopes.length === 0) return `${SHL_PREFIX}${suffix || "fg"}`;
  const joined = scopes.join("-");
  return `${SHL_PREFIX}${suffix === "" ? joined : `${joined}-${suffix}`}`;
}

const HAS_WHITESPACE = /\s/;
const WHITESPACE_RUN = /\s+/;

/**
 * "title.class_" -> ["title", "class_"]; "meta keyword" -> ["meta", "keyword"].
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

/** Best-effort (hex, rgb(), a few names) for `colorScheme` inference.
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

/** `"light"` when `bgValue` is missing or unparseable (e.g. a gradient).
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
 * `ThemeRole` -> hljs scope keys. `foreground`/`background` are handled by
 * callers.
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

/** @type {Set<string>} */
const KNOWN_SCOPE_SEGMENTS = new Set(
  Object.values(ROLE_SCOPES).flatMap((scopeKeys) =>
    scopeKeys.flatMap((scopeKey) => parseScopeKey(scopeKey)),
  ),
);

/**
 * Segments not used by any `ROLE_SCOPES` key (flags typos in dev).
 * @param {string} scopeKey
 * @returns {string[]}
 */
export function unknownScopeSegments(scopeKey) {
  return parseScopeKey(scopeKey).filter(
    (segment) => !KNOWN_SCOPE_SEGMENTS.has(segment),
  );
}

const TOKEN_STYLE_FIELD_TO_PROPERTY = {
  color: "color",
  background: "background-color",
  fontStyle: "font-style",
  fontWeight: "font-weight",
  textDecoration: "text-decoration",
};

/**
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
 * `key:value;...`, sorted by key (shared with the build for byte parity).
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
