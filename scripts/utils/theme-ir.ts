import {
  colorSchemeFor,
  SUPPORTED_PROPERTIES,
  varName,
} from "../../src/theme-vars.js";

export { colorSchemeFor, SUPPORTED_PROPERTIES, varName };

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
 * Shapes: `.hljs` (base), `.hljs-a` (single), `.hljs-a.b[.c]` (compound),
 * `.hljs-a .hljs-b` (descendant); anything else goes to a theme's extras.
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

/** Fallback scope for compound (anchor) and descendant (subject) selectors. */
export function subjectScope(shape: {
  kind: string;
  scopes: string[];
}): string[] | null {
  if (shape.kind === "compound") return [shape.scopes[0] as string];
  if (shape.kind === "descendant") return [shape.scopes[1] as string];
  return null;
}

const SIMPLE_COLOR_VALUE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\([^()]*\)|hsla?\([^()]*\)|[a-zA-Z]+)$/;

/** Gradients, images and multi-token shorthands go to extras instead. */
export function isSimpleColorValue(value: string): boolean {
  return SIMPLE_COLOR_VALUE.test(value.trim());
}
