import type { Declaration, Root, Rule } from "postcss";
import postcss from "postcss";
// Not `highlight-cascade.js`: it imports `themes/_base-css.js`, which this
// script generates.
import { shorthandBackgroundColor, substituteVars } from "../src/css-walk.js";
import { scopeSelectors } from "../src/scoped.js";
import { paletteToCss } from "../src/theme.js";
import type { ThemeInput } from "./build-styles.ts";
import { createMarkdown } from "./utils/create-markdown.ts";
import {
  canonicalizeProperty,
  classifySelector,
  colorSchemeFor,
  isSimpleColorValue,
  SUPPORTED_PROPERTIES,
  subjectScope,
  varName,
} from "./utils/theme-ir.ts";
import { writeTo } from "./utils/write-to.ts";

/** Emitted once in `base.css`; themes that differ are reported as mismatches. */
const STRUCTURAL_RULES: Array<{ selector: string; declText: string }> = [
  {
    selector: "pre code.hljs",
    declText: "display:block;overflow-x:auto;padding:1em",
  },
  { selector: "code.hljs", declText: "padding:3px 5px" },
];
const STRUCTURAL_SELECTORS = new Map(
  STRUCTURAL_RULES.map((rule) => [rule.selector, rule.declText]),
);

const PROPERTY_ORDER = [
  "color",
  "background-color",
  "font-style",
  "font-weight",
  "text-decoration",
];

type UnionEntry = {
  kind: "base" | "single" | "compound" | "descendant";
  scopes: string[];
  properties: Set<string>;
};

type ThemeArtifact = {
  name: string;
  moduleName: string;
  colorScheme: "light" | "dark";
  vars: Map<string, string>;
  extrasRaw: string;
  custom?: boolean;
};

type ThemeReportEntry = {
  name: string;
  convertedDeclarations: number;
  extrasDeclarations: number;
  excludedSelectors: string[];
};

function declText(decls: Declaration[]): string {
  return decls.map((d) => `${d.prop}:${d.value}`).join(";");
}

/** Selectors whose custom properties every `.hljs` element inherits. */
const ROOT_SELECTORS = new Set([":root", ":host", "html"]);

/**
 * Custom properties a theme sets on `:root`, `:host` or `html`, resolved
 * against each other. A palette has no such element to set them on, so
 * its values must not refer to them.
 */
function rootCustomProperties(root: Root): Map<string, string> {
  const raw = new Map<string, string>();
  root.walkRules((rule) => {
    if (rule.parent?.type !== "root") return;
    if (!rule.selectors.every((selector) => ROOT_SELECTORS.has(selector))) {
      return;
    }
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith("--")) raw.set(decl.prop, decl.value.trim());
    });
  });
  const resolved = new Map<string, string>();
  const resolving = new Set<string>();
  const lookup = (name: string): string | undefined => {
    if (resolved.has(name)) return resolved.get(name);
    const value = raw.get(name);
    if (value === undefined || resolving.has(name)) return undefined;
    resolving.add(name);
    const result = substituteVars(value, lookup) ?? undefined;
    resolving.delete(name);
    if (result !== undefined) resolved.set(name, result);
    return result;
  };
  for (const name of raw.keys()) lookup(name);
  return resolved;
}

/** A rule that only sets custom properties on the root element. */
function isRootVarRule(node: Rule): boolean {
  return (
    node.selectors.every((selector) => ROOT_SELECTORS.has(selector)) &&
    node.nodes.every((n) => n.type === "decl" && n.prop.startsWith("--"))
  );
}

/**
 * A declaration's value as a palette var can hold it: root custom
 * properties substituted, and `inherit` colors as `currentColor`. A var set
 * to `inherit` inherits the var, not the color, so it would be unset.
 */
function paletteValue(
  prop: string,
  value: string,
  rootVars: Map<string, string>,
): string {
  const substituted =
    rootVars.size === 0
      ? value
      : (substituteVars(value, (name) => rootVars.get(name)) ?? value);
  if (
    (prop === "color" || prop === "background-color") &&
    substituted.trim().toLowerCase() === "inherit"
  ) {
    return "currentColor";
  }
  return substituted.trim();
}

function processTheme(
  input: ThemeInput,
  selectorUnion: Map<string, UnionEntry>,
  structuralMismatches: Array<{ theme: string; selector: string }>,
): { artifact: ThemeArtifact; report: ThemeReportEntry } {
  const root = postcss.parse(input.css);
  const rootVars = rootCustomProperties(root);
  const vars = new Map<string, string>();
  const extras = new Map<string, Map<string, string>>();
  const rawBlocks: string[] = [];
  const excludedSelectors = new Set<string>();
  let convertedDeclarations = 0;
  let extrasDeclarations = 0;

  const addExtra = (selector: string, prop: string, value: string) => {
    let decls = extras.get(selector);
    if (!decls) {
      decls = new Map();
      extras.set(selector, decls);
    }
    decls.set(prop, value);
    extrasDeclarations++;
  };

  for (const node of root.nodes) {
    if (node.type === "atrule") {
      // Conditional overrides (e.g. high-contrast media queries) can't be vars.
      rawBlocks.push(node.toString());
      continue;
    }
    if (node.type !== "rule") continue;
    // Resolved into the values that use them, below.
    if (rootVars.size > 0 && isRootVarRule(node)) continue;

    const decls = node.nodes.filter((n): n is Declaration => n.type === "decl");

    for (const rawSelector of node.selectors) {
      const normalized = rawSelector.replace(/\s+/g, " ").trim();

      const structural = STRUCTURAL_SELECTORS.get(normalized);
      if (structural !== undefined) {
        if (declText(decls) !== structural) {
          structuralMismatches.push({
            theme: input.name,
            selector: normalized,
          });
          for (const decl of decls) addExtra(normalized, decl.prop, decl.value);
        }
        continue;
      }

      const shape = classifySelector(normalized);

      for (const decl of decls) {
        const prop = canonicalizeProperty(decl.prop);
        let value = paletteValue(prop, decl.value, rootVars);

        const shapeSupported = shape.kind !== "unsupported";
        const propSupported = SUPPORTED_PROPERTIES.has(prop);
        const valueSimpleEnough =
          prop !== "background-color" || isSimpleColorValue(value);

        if (!shapeSupported || !propSupported || !valueSimpleEnough) {
          excludedSelectors.add(normalized);
          addExtra(normalized, decl.prop, value);
          // An image background still names a color under the image. Keep
          // it as the var too, so a palette without its extras isn't
          // left without a background.
          if (shape.kind === "unsupported" || prop !== "background-color") {
            continue;
          }
          const color = shorthandBackgroundColor(value);
          if (color === "transparent" || !isSimpleColorValue(color)) continue;
          value = color;
        }

        const vn = varName(shape.scopes, prop);
        if (!vn) continue; // unreachable: propSupported already checked

        vars.set(vn, value);
        convertedDeclarations++;

        const existing = selectorUnion.get(normalized);
        if (existing) existing.properties.add(prop);
        else {
          selectorUnion.set(normalized, {
            kind: shape.kind,
            scopes: shape.scopes,
            properties: new Set([prop]),
          });
        }
      }
    }
  }

  for (const [selector, decls] of extras) {
    rawBlocks.unshift(
      `${selector}{${[...decls.entries()]
        .map(([prop, value]) => `${prop}:${value}`)
        .join(";")}}`,
    );
  }
  const extrasRaw = rawBlocks.join("");

  const colorScheme = colorSchemeFor(vars.get("--shl-bg"));

  return {
    artifact: {
      name: input.name,
      moduleName: input.moduleName,
      colorScheme,
      vars,
      extrasRaw,
      ...(input.custom ? { custom: true } : {}),
    },
    report: {
      name: input.name,
      convertedDeclarations,
      extrasDeclarations,
      excludedSelectors: [...excludedSelectors].sort(),
    },
  };
}

/**
 * The scopes whose var `entry`'s `prop` falls back to. A compound such as
 * `.hljs-title.class_.inherited__` falls back to its longest shorter
 * compound that sets `prop` (`.hljs-title.class_`), since that rule also
 * matches it in the theme CSS, and only then to its anchor (`.hljs-title`).
 */
function fallbackScopes(
  entry: Pick<UnionEntry, "kind" | "scopes">,
  prop: string,
  selectorUnion: Map<string, UnionEntry>,
): string[] | null {
  const subject = subjectScope(entry);
  if (!subject) return null;
  if (entry.kind === "compound") {
    for (let length = entry.scopes.length - 1; length >= 2; length--) {
      const prefix = entry.scopes.slice(0, length);
      const selector = `.hljs-${prefix.join(".")}`;
      if (selectorUnion.get(selector)?.properties.has(prop)) return prefix;
    }
  }
  return subject;
}

/** `var(<scopes' var>, <its fallback chain>)`, down to a single scope. */
function varChain(
  scopes: string[],
  prop: string,
  selectorUnion: Map<string, UnionEntry>,
): string {
  const vn = varName(scopes, prop) as string;
  const kind = scopes.length > 1 ? "compound" : "single";
  const entry = selectorUnion.get(`.hljs-${scopes.join(".")}`);
  const fallback =
    entry && kind === "compound"
      ? fallbackScopes({ kind, scopes }, prop, selectorUnion)
      : null;
  return fallback
    ? `var(${vn}, ${varChain(fallback, prop, selectorUnion)})`
    : `var(${vn})`;
}

/** `--shl-*` var -> the var it falls back to in `base.css`, for runtime theme merging. */
function buildFallbackMap(
  selectorUnion: Map<string, UnionEntry>,
): Map<string, string> {
  const fallbacks = new Map<string, string>();
  for (const entry of selectorUnion.values()) {
    for (const prop of entry.properties) {
      const fallback = fallbackScopes(entry, prop, selectorUnion);
      if (!fallback) continue;
      const vn = varName(entry.scopes, prop);
      const fallbackVn = varName(fallback, prop);
      if (vn && fallbackVn) fallbacks.set(vn, fallbackVn);
    }
  }
  return fallbacks;
}

function buildBaseCss(selectorUnion: Map<string, UnionEntry>): string {
  const structural = STRUCTURAL_RULES.map(
    (rule) => `${rule.selector}{${rule.declText}}`,
  ).join("");

  const kindOrder: Record<UnionEntry["kind"], number> = {
    base: 0,
    single: 1,
    compound: 2,
    descendant: 2,
  };

  const sorted = [...selectorUnion.entries()].sort(([aSel, a], [bSel, b]) => {
    const orderDiff = kindOrder[a.kind] - kindOrder[b.kind];
    if (orderDiff !== 0) return orderDiff;
    return aSel.localeCompare(bSel);
  });

  const rules = sorted.map(([selector, entry]) => {
    const decls = PROPERTY_ORDER.filter((prop) => entry.properties.has(prop))
      .map((prop) => {
        const vn = varName(entry.scopes, prop) as string;
        const fallback = fallbackScopes(entry, prop, selectorUnion);
        if (!fallback) return `${prop}:var(${vn})`;
        return `${prop}:var(${vn}, ${varChain(fallback, prop, selectorUnion)})`;
      })
      .join(";");
    return `${selector}{${decls}}`;
  });

  return structural + rules.join("");
}

/**
 * Sets every variable `baseCss` reads to `initial` on each
 * `[data-shl-theme]` element, so a scoped theme doesn't inherit the
 * variables it leaves out from another theme's `:root`. `:where()` keeps
 * it below every theme's own rule, whatever order they load in.
 */
function buildScopeReset(baseCss: string): string {
  const names = new Set(
    [...baseCss.matchAll(/var\((--shl-[\w-]+)/g)].map((match) => match[1]),
  );
  const decls = [...names]
    .sort()
    .map((name) => `${name}:initial`)
    .join(";");
  return `:where([data-shl-theme]){${decls}}`;
}

export async function buildThemes(themeInputs: ThemeInput[]) {
  console.time("build themes");
  await Bun.$`rm -rf src/themes; mkdir src/themes`;

  const sortedInputs = themeInputs
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectorUnion = new Map<string, UnionEntry>();
  const structuralMismatches: Array<{ theme: string; selector: string }> = [];
  const artifacts: ThemeArtifact[] = [];
  const reportEntries: ThemeReportEntry[] = [];

  for (const input of sortedInputs) {
    const { artifact, report } = processTheme(
      input,
      selectorUnion,
      structuralMismatches,
    );
    artifacts.push(artifact);
    reportEntries.push(report);
  }

  const baseCss = buildBaseCss(selectorUnion);
  const fallbackMap = buildFallbackMap(selectorUnion);

  const allWrites: Promise<void>[] = [];

  allWrites.push(
    writeTo("src/themes/base.css", buildScopeReset(baseCss) + baseCss),
  );

  const fallbackEntries = [...fallbackMap.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const fallbackJs = `export const SHL_FALLBACKS = {\n${fallbackEntries
    .map(
      ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
    )
    .join("\n")}\n};\n`;
  allWrites.push(writeTo("src/themes/_shl-fallbacks.js", fallbackJs));
  allWrites.push(
    writeTo(
      "src/themes/_shl-fallbacks.d.ts",
      "export declare const SHL_FALLBACKS: Record<string, string>;\n",
    ),
  );
  // `base.css` as a string, so Highlight's "css-highlights" engine can resolve
  // a palette's colors through the same rules the "dom" engine uses.
  allWrites.push(
    writeTo(
      "src/themes/_base-css.js",
      `export const BASE_CSS = ${JSON.stringify(baseCss)};\n`,
    ),
  );
  allWrites.push(
    writeTo(
      "src/themes/_base-css.d.ts",
      "export declare const BASE_CSS: string;\n",
    ),
  );

  for (const artifact of artifacts) {
    const palette = {
      name: artifact.name,
      colorScheme: artifact.colorScheme,
      vars: Object.fromEntries(
        [...artifact.vars].sort(([a], [b]) => a.localeCompare(b)),
      ),
      ...(artifact.extrasRaw && { extras: artifact.extrasRaw }),
    };
    const js = `const ${artifact.moduleName} = ${JSON.stringify(palette)};\nexport default ${artifact.moduleName};\n`;
    const scopedExtras = artifact.extrasRaw
      ? scopeSelectors(
          artifact.extrasRaw,
          (selector) => `[data-shl-theme="${artifact.name}"] ${selector}`,
        )
      : "";
    const css = paletteToCss(palette) + scopedExtras;

    allWrites.push(writeTo(`src/themes/${artifact.name}.js`, js));
    allWrites.push(
      writeTo(
        `src/themes/${artifact.name}.d.ts`,
        `export { ${artifact.moduleName} as default } from "./";\n`,
      ),
    );
    allWrites.push(writeTo(`src/themes/${artifact.name}.css`, css));
  }

  const indexJs = artifacts
    .map(
      (a) => `export { default as ${a.moduleName} } from './${a.name}.js';\n`,
    )
    .join("");
  const indexDts =
    `import type { ThemePalette } from "../theme.d.ts";\n\n` +
    artifacts
      .map((a) => `export declare const ${a.moduleName}: ThemePalette;\n`)
      .join("");

  allWrites.push(writeTo("src/themes/index.js", indexJs));
  allWrites.push(writeTo("src/themes/index.d.ts", indexDts));

  const customCount = artifacts.filter((a) => a.custom).length;
  const markdown =
    createMarkdown("Themes", artifacts.length, customCount) +
    artifacts
      .map((a) => {
        const customNote = a.custom
          ? "\n> Custom svelte-highlight theme (not exported by highlight.js)\n"
          : "";
        return `## ${a.name} (\`${a.moduleName}\`)
${customNote}
**CSS variables (global)**

\`\`\`html
<script>
  import "svelte-highlight/themes/base.css";
  import "svelte-highlight/themes/${a.name}.css";
</script>
\`\`\`\n\n

**Palette object**

\`\`\`svelte
<script>
  import { HighlightStyle } from "svelte-highlight";
  import ${a.moduleName} from "svelte-highlight/themes/${a.name}";
  import "svelte-highlight/themes/base.css";
</script>

<HighlightStyle theme={${a.moduleName}}>
  <Highlight ... />
</HighlightStyle>
\`\`\`\n\n`;
      })
      .join("");
  allWrites.push(writeTo("SUPPORTED_THEMES.md", markdown));

  const report = {
    structuralRules: STRUCTURAL_RULES,
    structuralMismatches,
    themes: reportEntries,
  };
  allWrites.push(
    Bun.write(
      "www/data/themes-report.json",
      JSON.stringify(report, null, 2),
    ).then(() => {}),
  );

  await Promise.all(allWrites);

  console.timeEnd("build themes");

  return { report };
}
