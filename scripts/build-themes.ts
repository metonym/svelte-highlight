import type { Declaration } from "postcss";
import postcss from "postcss";
import { scopeSelectors } from "../src/scoped.js";
import type { ThemeInput } from "./build-styles.ts";
import { createMarkdown } from "./utils/create-markdown.ts";
import {
  canonicalizeProperty,
  classifySelector,
  colorSchemeFor,
  isSimpleColorValue,
  SUPPORTED_PROPERTIES,
  varName,
} from "./utils/theme-ir.ts";
import { writeTo } from "./utils/write-to.ts";

/** Emitted once, literally, in `base.css` — verified uniform across the
 * whole corpus below rather than assumed. */
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

/** Declarations are emitted in this order wherever a selector needs more
 * than one. */
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

function serializeVars(vars: Map<string, string>): string {
  return [...vars.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function processTheme(
  input: ThemeInput,
  selectorUnion: Map<string, UnionEntry>,
  structuralMismatches: Array<{ theme: string; selector: string }>,
): { artifact: ThemeArtifact; report: ThemeReportEntry } {
  const root = postcss.parse(input.css);
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
      // Conditional overrides (e.g. Windows high-contrast mode media
      // queries) never fit the unconditional var contract.
      rawBlocks.push(node.toString());
      continue;
    }
    if (node.type !== "rule") continue;

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
        const value = decl.value.trim();

        const shapeSupported = shape.kind !== "unsupported";
        const propSupported = SUPPORTED_PROPERTIES.has(prop);
        const valueSimpleEnough =
          prop !== "background-color" || isSimpleColorValue(value);

        if (!shapeSupported || !propSupported || !valueSimpleEnough) {
          excludedSelectors.add(normalized);
          addExtra(normalized, decl.prop, decl.value);
          continue;
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
    },
    report: {
      name: input.name,
      convertedDeclarations,
      extrasDeclarations,
      excludedSelectors: [...excludedSelectors].sort(),
    },
  };
}

/** The scope a multi-scope selector's variable falls back to when unset —
 * mirrors `subjectScope` in `theme-ir.ts` but over the union's plain
 * `kind`/`scopes` pair instead of the full `SelectorShape` union. */
function subjectFor(entry: UnionEntry): string[] | null {
  if (entry.kind === "compound") return [entry.scopes[0] as string];
  if (entry.kind === "descendant") return [entry.scopes[1] as string];
  return null;
}

/**
 * `--shl-*` var name -> the single fallback var name `base.css` encodes
 * for it (the same pairs `buildBaseCss` wraps in `var(x, var(y))`).
 * `HighlightStyle`'s light/dark merge (`src/theme-style.js`) imports this
 * so its runtime fallback resolution can't drift from what the structural
 * stylesheet actually does — it's generated, not re-derived heuristically.
 */
function buildFallbackMap(
  selectorUnion: Map<string, UnionEntry>,
): Map<string, string> {
  const fallbacks = new Map<string, string>();
  for (const entry of selectorUnion.values()) {
    const subject = subjectFor(entry);
    if (!subject) continue;
    for (const prop of entry.properties) {
      const vn = varName(entry.scopes, prop);
      const fallbackVn = varName(subject, prop);
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
    const subject = subjectFor(entry);
    const decls = PROPERTY_ORDER.filter((prop) => entry.properties.has(prop))
      .map((prop) => {
        const vn = varName(entry.scopes, prop) as string;
        if (!subject) return `${prop}:var(${vn})`;
        const fallback = varName(subject, prop) as string;
        return `${prop}:var(${vn}, var(${fallback}))`;
      })
      .join(";");
    return `${selector}{${decls}}`;
  });

  return structural + rules.join("");
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

  allWrites.push(writeTo("src/themes/base.css", baseCss));

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

  for (const artifact of artifacts) {
    const varsEntries = [...artifact.vars.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const varsJs = varsEntries
      .map(
        ([key, value]) =>
          `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
      )
      .join("\n");

    const hasExtras = artifact.extrasRaw.length > 0;
    const js = `const ${artifact.moduleName} = {
  name: ${JSON.stringify(artifact.name)},
  colorScheme: ${JSON.stringify(artifact.colorScheme)},
  vars: {
${varsJs}
  },${hasExtras ? `\n  extras: ${JSON.stringify(artifact.extrasRaw)},` : ""}
};

export default ${artifact.moduleName};
`;

    const varsCss = serializeVars(artifact.vars);
    const scopedExtras = hasExtras
      ? scopeSelectors(
          artifact.extrasRaw,
          (selector) => `[data-shl-theme="${artifact.name}"] ${selector}`,
        )
      : "";
    const css =
      `:root{${varsCss}}` +
      `[data-shl-theme="${artifact.name}"]{${varsCss}}` +
      artifact.extrasRaw +
      scopedExtras;

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

  const markdown =
    createMarkdown("Themes", artifacts.length) +
    artifacts
      .map(
        (a) => `## ${a.name} (\`${a.moduleName}\`)

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
\`\`\`\n\n`,
      )
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
