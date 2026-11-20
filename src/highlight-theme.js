// `.hljs-<scope>` rules -> `::highlight(hljs-<scope>)` for HighlightEditable's
// css-highlights engine. Only color/background-color work cross-browser, and
// only single-class selectors have an equivalent; everything else is dropped.
// Highlight resolves colors per token instead (highlight-cascade.js).

import { forEachRule, splitTopLevel } from "./css-walk.js";
import { SHL_FALLBACKS } from "./themes/_shl-fallbacks.js";

const SIMPLE_SCOPE_SELECTOR = /^\.hljs-([\w-]+)$/;
const SUPPORTED_PROPERTIES = new Set(["color", "background-color"]);

// Base `.hljs` vars: not a scope.
const BASE_VAR_NAMES = new Set([
  "--shl-fg",
  "--shl-bg",
  "--shl-font-style",
  "--shl-font-weight",
  "--shl-text-decoration",
]);

/** @type {Array<[string, string]>} */
const SUFFIX_PROPERTY = [
  ["-bg", "background-color"],
  ["-font-style", "font-style"],
  ["-font-weight", "font-weight"],
  ["-text-decoration", "text-decoration"],
];

const VAR_PREFIX_LENGTH = "--shl-".length;

/**
 * Inverse of `varName()` for a single-scope var.
 * @param {string} shlVarName
 */
function decomposeSingleScopeVar(shlVarName) {
  for (const [suffix, property] of SUFFIX_PROPERTY) {
    if (shlVarName.endsWith(suffix)) {
      return {
        scope: shlVarName.slice(VAR_PREFIX_LENGTH, -suffix.length),
        property,
      };
    }
  }
  return { scope: shlVarName.slice(VAR_PREFIX_LENGTH), property: "color" };
}

/** @param {string} body */
function colorDeclarations(body) {
  return splitTopLevel(body, ";")
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      if (colon === -1) return null;
      const prop = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      return value && SUPPORTED_PROPERTIES.has(prop) ? { prop, value } : null;
    })
    .filter((declaration) => declaration !== null);
}

/**
 * @param {string} prelude Selector list preceding a rule's `{`.
 * @param {string} body Declarations between the matching `{` and `}`.
 */
function highlightRulesFor(prelude, body) {
  const declarations = colorDeclarations(body);
  if (declarations.length === 0) return "";
  const decl = declarations
    .map(({ prop, value }) => `${prop}:${value}`)
    .join(";");

  return splitTopLevel(prelude, ",")
    .map((selector) => SIMPLE_SCOPE_SELECTOR.exec(selector.trim()))
    .filter((match) => match !== null)
    .map((match) => `::highlight(hljs-${match[1]}){${decl}}`)
    .join("");
}

/**
 * @param {string} theme Theme CSS (optionally `<style>`-wrapped).
 * @returns {string} Converted `::highlight()` rules, concatenated.
 */
export function highlightRules(theme) {
  let out = "";
  forEachRule(theme, (prelude, body) => {
    out += highlightRulesFor(prelude, body);
  });
  return out;
}

/**
 * Multi-scope vars (keys of `SHL_FALLBACKS`) have no equivalent and are skipped.
 * @param {import("./theme.d.ts").ThemePalette} palette
 * @returns {string} Converted `::highlight()` rules, concatenated.
 */
export function highlightRulesFromPalette(palette) {
  /** @type {Map<string, Record<string, string>>} */
  const byScope = new Map();

  for (const [key, value] of Object.entries(palette.vars)) {
    if (BASE_VAR_NAMES.has(key) || key in SHL_FALLBACKS) continue;

    const { scope, property } = decomposeSingleScopeVar(key);
    if (!SUPPORTED_PROPERTIES.has(property)) continue;

    let decls = byScope.get(scope);
    if (!decls) {
      decls = {};
      byScope.set(scope, decls);
    }
    decls[property] = value;
  }

  let out = "";
  for (const [scope, decls] of byScope) {
    const decl = Object.entries(decls)
      .map(([prop, value]) => `${prop}:${value}`)
      .join(";");
    out += `::highlight(hljs-${scope}){${decl}}`;
  }
  return out;
}

/**
 * Lives here, not in a component: svelte-preprocess matches a
 * literal style tag inside `<script>` as the component's `<style>` block.
 * @param {string | import("./theme.d.ts").ThemePalette} theme
 * @param {string} instanceId Inserted into each highlight name.
 * @returns {string} `<style>`-wrapped `::highlight(hljs-<id>-<scope>)` rules.
 */
export function instanceHighlightStyle(theme, instanceId) {
  const rules =
    typeof theme === "object"
      ? highlightRulesFromPalette(theme)
      : highlightRules(theme);
  return `<style>${rules.replaceAll(
    "::highlight(hljs-",
    `::highlight(hljs-${instanceId}-`,
  )}</style>`;
}
