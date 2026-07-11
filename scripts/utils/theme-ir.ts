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
 *
 * The `--shl-*` var-name derivation itself (`varName`, `colorSchemeFor`,
 * ...) lives in `src/theme-vars.js`, shared with the runtime
 * theme-authoring API (`src/theme.js`) — re-exported here so existing
 * importers of this module are unaffected.
 */

import {
  SUPPORTED_PROPERTIES,
  colorSchemeFor,
  parseColorToRgb,
  varName,
} from "../../src/theme-vars.js";

export { colorSchemeFor, parseColorToRgb, varName, SUPPORTED_PROPERTIES };

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
