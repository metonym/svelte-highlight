/**
 * Pure classification/derivation helpers for compiling highlight.js theme
 * CSS into `--shl-*` custom property names (see `build-themes.ts`).
 *
 * Selector shapes recognized (anything else is "unsupported" and routed to
 * a theme's `extras`):
 * - `.hljs` — base scope.
 * - `.hljs-<scope>` — single scope.
 * - `.hljs-<a>.<b>[.<c>...]` — compound (no combinator between parts; the
 *   first part must be `hljs-`-prefixed, later parts may or may not be).
 * - `.hljs-<a> .hljs-<b>` — descendant (exactly two levels).
 */

const SHL_PREFIX = "--shl-";

/** CSS property -> `--shl-*` name suffix. `""` means no suffix (color is
 * the dominant, unsuffixed case). Only these properties fit the var
 * contract; anything else is routed to extras. */
const PROP_SUFFIX: Record<string, string> = {
  color: "",
  "background-color": "bg",
  "font-style": "font-style",
  "font-weight": "font-weight",
  "text-decoration": "text-decoration",
};

export const SUPPORTED_PROPERTIES = new Set(Object.keys(PROP_SUFFIX));

/** `background` is normalized to `background-color` — one property per
 * rule in the IR, regardless of which shorthand/longhand a theme used. */
export function canonicalizeProperty(prop: string): string {
  const lower = prop.toLowerCase();
  return lower === "background" ? "background-color" : lower;
}

export type SelectorShape =
  | { kind: "base"; scopes: [] }
  | { kind: "single"; scopes: [string] }
  | { kind: "compound"; scopes: string[] }
  | { kind: "descendant"; scopes: [string, string] }
  | { kind: "unsupported"; scopes: [] };

const SINGLE_SELECTOR = /^\.hljs-([\w-]+)$/;
const DESCENDANT_SELECTOR = /^\.hljs-([\w-]+) \.hljs-([\w-]+)$/;
const DISALLOWED_CHARS = /[\s>+~:]/;
const COMPOUND_PART = /^(?:hljs-)?[\w-]+$/;

/**
 * Classify a single (already comma-split) selector. Internal whitespace is
 * normalized first so a descendant combinator expressed as a newline (an
 * artifact of some themes' source formatting) is treated the same as a
 * space.
 */
export function classifySelector(rawSelector: string): SelectorShape {
  const normalized = rawSelector.replace(/\s+/g, " ").trim();

  if (normalized === ".hljs") return { kind: "base", scopes: [] };

  const single = SINGLE_SELECTOR.exec(normalized);
  if (single?.[1]) return { kind: "single", scopes: [single[1]] };

  const descendant = DESCENDANT_SELECTOR.exec(normalized);
  if (descendant?.[1] && descendant[2]) {
    return { kind: "descendant", scopes: [descendant[1], descendant[2]] };
  }

  if (!DISALLOWED_CHARS.test(normalized)) {
    const parts = normalized.split(".").filter(Boolean);
    if (
      parts.length >= 2 &&
      parts[0]?.startsWith("hljs-") &&
      parts.every((part) => COMPOUND_PART.test(part))
    ) {
      const scopes = parts.map((part) => part.replace(/^hljs-/, ""));
      return { kind: "compound", scopes };
    }
  }

  return { kind: "unsupported", scopes: [] };
}

/**
 * The scope a multi-scope selector's variable falls back to when the
 * theme never sets it — the compound's anchor class for compounds, the
 * rightmost (subject) class for descendants. `null` for shapes that don't
 * need a fallback (base/single have nothing more specific to lose to).
 */
export function subjectScope(shape: SelectorShape): string[] | null {
  if (shape.kind === "compound") return [shape.scopes[0] as string];
  if (shape.kind === "descendant") return [shape.scopes[1]];
  return null;
}

/** `null` when `property` isn't part of the var contract. */
export function varName(scopes: string[], property: string): string | null {
  const suffix = PROP_SUFFIX[property];
  if (suffix === undefined) return null;
  if (scopes.length === 0) {
    const base = suffix === "" ? "fg" : suffix === "bg" ? "bg" : suffix;
    return `${SHL_PREFIX}${base}`;
  }
  const joined = scopes.join("-");
  return `${SHL_PREFIX}${suffix === "" ? joined : `${joined}-${suffix}`}`;
}

const SIMPLE_COLOR_VALUE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\([^()]*\)|hsla?\([^()]*\)|[a-zA-Z]+)$/;

/**
 * Whether a `background`/`background-color` value is a plain color the var
 * contract can represent. Gradients, images, and multi-token shorthands
 * (position/repeat/image + trailing color) fail this and are routed to
 * extras instead of being torn apart.
 */
export function isSimpleColorValue(value: string): boolean {
  return SIMPLE_COLOR_VALUE.test(value.trim());
}

const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  gold: [255, 215, 0],
  navy: [0, 0, 128],
};

/** Best-effort color parse for `colorScheme` inference; not a general CSS
 * color parser (hex + rgb()/rgba() + the handful of named colors themes
 * actually use are all that's needed here). */
export function parseColorToRgb(
  value: string,
): [number, number, number] | null {
  const v = value.trim().toLowerCase();
  const named = NAMED_COLORS[v];
  if (named) return named;

  const hex3 = /^#([0-9a-f]{3})$/.exec(v);
  if (hex3?.[1]) {
    const digits = hex3[1];
    return [0, 1, 2].map((i) => {
      const ch = digits[i] as string;
      return Number.parseInt(ch + ch, 16);
    }) as [number, number, number];
  }

  const hex6 = /^#([0-9a-f]{6})[0-9a-f]{0,2}$/.exec(v);
  if (hex6?.[1]) {
    const hex = hex6[1];
    return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as [
      number,
      number,
      number,
    ];
  }

  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(v);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return null;
}

/** Falls back to `"light"` when `bgValue` is missing or unparseable — a
 * theme whose background never resolved to a var (e.g. a gradient) still
 * needs *some* metadata value. */
export function colorSchemeFor(bgValue: string | undefined): "light" | "dark" {
  const rgb = bgValue ? parseColorToRgb(bgValue) : null;
  if (!rgb) return "light";
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "light" : "dark";
}
