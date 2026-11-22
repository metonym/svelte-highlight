// @depends-on scripts/build-themes.ts scripts/build-styles.ts scripts/custom-styles/**
// @reads src/themes/** src/styles/**
/**
 * Fidelity differential (the load-bearing test for the theme-palette
 * compiler): for every shipped theme, resolve `themes/base.css` +
 * `themes/<name>.js` (read from disk, i.e. the emitted build artifacts, not
 * the in-memory build IR) into a `selector -> {property: value}` map and
 * assert it reproduces every declaration in the legacy
 * `styles/<name>.css` — modulo whatever that theme routed into `extras`.
 *
 * The comparison is one-directional (legacy declarations must all appear,
 * correctly valued, in the reconstruction): the union nature of `base.css`
 * plus fallback chains can legitimately introduce *extra* resolved
 * declarations for selectors a given theme never styled directly (that's
 * the fallback mechanism working as intended, equivalent to what CSS
 * inheritance would already do) — those aren't fidelity breaks.
 */
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import type { ThemePalette } from "../src/theme.d.ts";

const THEMES_DIR = path.join(import.meta.dir, "../src/themes");
const STYLES_DIR = path.join(import.meta.dir, "../src/styles");

const themeNames = fs
  .readdirSync(THEMES_DIR)
  .filter((f) => f.endsWith(".js") && f !== "index.js" && !f.startsWith("_"))
  .map((f) => f.replace(/\.js$/, ""))
  .sort();

const baseCss = fs.readFileSync(path.join(THEMES_DIR, "base.css"), "utf8");
const baseRoot = postcss.parse(baseCss);

type DeclMap = Map<string, Map<string, string>>;

function canonicalizeProperty(prop: string): string {
  const lower = prop.toLowerCase();
  return lower === "background" ? "background-color" : lower;
}

function setDecl(map: DeclMap, selector: string, prop: string, value: string) {
  let decls = map.get(selector);
  if (!decls) {
    decls = new Map();
    map.set(selector, decls);
  }
  decls.set(prop, value);
}

const VAR_CHAIN = /^(?:var\(--[\w-]+(?:, )?)+\)+$/;
const VAR_NAME = /var\((--[\w-]+)/g;

/** Resolve `base.css`'s `var(--x[, var(--y[, ...])])` declarations against
 * one theme's `vars`, taking the first var in the chain the theme sets. */
function reconstructFromBase(vars: Record<string, string>): DeclMap {
  const reconstructed: DeclMap = new Map();

  for (const node of baseRoot.nodes) {
    if (node.type !== "rule") continue;
    for (const decl of node.nodes) {
      if (decl.type !== "decl") continue;
      if (!VAR_CHAIN.test(decl.value)) {
        // Structural literal rules (pre code.hljs / code.hljs): no var().
        setDecl(reconstructed, node.selector, decl.prop, decl.value);
        continue;
      }
      const value = [...decl.value.matchAll(VAR_NAME)]
        .map((match) => vars[match[1] as string])
        .find((candidate) => candidate !== undefined);
      if (value !== undefined) {
        setDecl(reconstructed, node.selector, decl.prop, value);
      }
    }
  }

  return reconstructed;
}

/** `selector -> property` pairs a theme routed to `extras` (raw CSS,
 * possibly containing `@media`-nested rules) — excluded from the legacy
 * comparison since they're accounted for outside the var contract. */
function excludedKeysFrom(extras: string | undefined): Set<string> {
  const excluded = new Set<string>();
  if (!extras) return excluded;
  const root = postcss.parse(extras);
  root.walkRules((rule) => {
    for (const selector of rule.selectors) {
      const normalized = selector.replace(/\s+/g, " ").trim();
      rule.walkDecls((decl) => {
        excluded.add(`${normalized}::${canonicalizeProperty(decl.prop)}`);
      });
    }
  });
  return excluded;
}

function legacyDeclMap(css: string): DeclMap {
  const root = postcss.parse(css);
  const legacy: DeclMap = new Map();
  for (const node of root.nodes) {
    if (node.type !== "rule") continue;
    for (const selector of node.selectors) {
      const normalized = selector.replace(/\s+/g, " ").trim();
      for (const decl of node.nodes) {
        if (decl.type !== "decl") continue;
        setDecl(
          legacy,
          normalized,
          canonicalizeProperty(decl.prop),
          decl.value.trim(),
        );
      }
    }
  }
  return legacy;
}

const ROOT_SELECTORS = new Set([":root", ":host", "html"]);
const VAR_REF = /var\((--[\w-]+)\)/g;

/** Custom properties the legacy CSS sets on `:root`, `:host` or `html`. */
function legacyRootVars(css: string): Map<string, string> {
  const vars = new Map<string, string>();
  postcss.parse(css).walkRules((rule) => {
    if (!rule.selectors.every((selector) => ROOT_SELECTORS.has(selector))) {
      return;
    }
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith("--")) vars.set(decl.prop, decl.value.trim());
    });
  });
  return vars;
}

/**
 * The legacy value as the palette stores it: root custom properties
 * substituted, since a palette has no root element to set them on, and an
 * `inherit` color as `currentColor`, since a var set to `inherit` would be
 * unset rather than inherit the color.
 */
function paletteForm(
  prop: string,
  value: string,
  rootVars: Map<string, string>,
): string {
  const substituted = value.replace(
    VAR_REF,
    (ref, name: string) => rootVars.get(name) ?? ref,
  );
  if (
    (prop === "color" || prop === "background-color") &&
    substituted.toLowerCase() === "inherit"
  ) {
    return "currentColor";
  }
  return substituted;
}

describe("theme fidelity differential", () => {
  it("compiled at least one theme per legacy stylesheet", () => {
    const legacyNames = fs
      .readdirSync(STYLES_DIR)
      .filter((f) => f.endsWith(".css"))
      .map((f) => f.replace(/\.css$/, ""))
      .sort();
    expect(themeNames).toEqual(legacyNames);
  });

  for (const name of themeNames) {
    it(`reproduces every legacy declaration for "${name}"`, async () => {
      const mod = (await import(path.join(THEMES_DIR, `${name}.js`))) as {
        default: ThemePalette;
      };
      const palette = mod.default;

      const legacyCss = fs.readFileSync(
        path.join(STYLES_DIR, `${name}.css`),
        "utf8",
      );
      const legacy = legacyDeclMap(legacyCss);
      const rootVars = legacyRootVars(legacyCss);
      const excluded = excludedKeysFrom(palette.extras);
      const reconstructed = reconstructFromBase(palette.vars);

      const unexplainedDiffs: string[] = [];

      for (const [selector, decls] of legacy) {
        for (const [prop, value] of decls) {
          const key = `${selector}::${prop}`;
          if (excluded.has(key)) continue;
          // Substituted into the values that use them; see `paletteForm`.
          if (ROOT_SELECTORS.has(selector) && prop.startsWith("--")) continue;

          const actual = reconstructed.get(selector)?.get(prop);
          if (actual !== paletteForm(prop, value, rootVars)) {
            unexplainedDiffs.push(
              `${selector} { ${prop}: ${value} } -> got ${JSON.stringify(actual)}`,
            );
          }
        }
      }

      expect(unexplainedDiffs).toEqual([]);
    });
  }
});
