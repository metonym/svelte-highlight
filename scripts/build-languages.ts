import { $ } from "bun";
import hljs from "highlight.js";
import type { ModuleNames } from "./build-styles.ts";
import { createMarkdown } from "./utils/create-markdown.ts";
import { CONTAINS_DASH, STARTS_WITH_DIGIT } from "./utils/regexes.ts";
import { toCamelCase } from "./utils/to-camel-case.ts";
import { writeTo } from "./utils/write-to.ts";

type CustomLanguage = {
  name: string;
  moduleName: string;
  path: string;
};

/** Grammar names in `custom-languages/`; each `<name>.js` exports `<name>`. */
const CUSTOM_LANGUAGE_NAMES = [
  "html",
  "astro",
  "svelte",
  "vue",
  "mdx",
  "marko",
  "hcl",
  "prisma",
  "solidity",
  "zig",
  "toml",
  "fish",
  "nushell",
  "gleam",
  "liquid",
  "blade",
  "json5",
  "jsonc",
  "dotenv",
  "wgsl",
  "cypher",
  "promql",
  "bicep",
  "rescript",
  "starlark",
  "move",
  "cairo",
  "vyper",
  "clarity",
  "cue",
  "jsonnet",
  "dhall",
  "pkl",
  "nickel",
  "pug",
  "razor",
  "v",
  "odin",
  "caddy",
  "d2",
  "bibtex",
  "groq",
  "jq",
  "kql",
  "logql",
  "rego",
  "dax",
  "typst",
  "rst",
  "templ",
  "hlsl",
  "just",
  "gdscript",
  "heex",
  "sparql",
  "prql",
  "flux",
  "cql",
  "tsrx",
  "angular",
  "mermaid",
  "kdl",
  "earthfile",
  "luau",
  "polar",
  "cedar",
  "esql",
  "traceql",
  "jinja",
  "wit",
  "surrealql",
  "hurl",
  "mojo",
  "assemblyscript",
  "purescript",
  "lean",
  "agda",
  "idris",
  "racket",
  "fennel",
  "jsonata",
  "jmespath",
  "cel",
  "datalog",
  "splunk",
  "vrl",
  "civet",
  "imba",
  "slint",
  "ejs",
  "gotmpl",
  "helm",
  "blueprint",
  "kv",
  "baml",
  "modelfile",
  "gbnf",
  "tsq",
  "verse",
  "roc",
  "c3",
  "bend",
  "uiua",
  "bqn",
  "raku",
  "koka",
  "unison",
  "kcl",
  "typespec",
  "smithy",
  "yara",
  "snort",
  "codeql",
  "cisco",
  "yang",
  "bpftrace",
  "dtrace",
  "rpmspec",
  "bitbake",
  "kconfig",
  "ldscript",
  "vcl",
  "haproxy",
  "systemd",
  "crontab",
  "graphviz",
  "plantuml",
  "structurizr",
  "org",
  "djot",
  "markdoc",
  "regex",
  "powerquery",
  "lookml",
  "tsql",
  "plsql",
  "turtle",
  "textproto",
  "ron",
  "hocon",
  "csv",
  "log",
  "gdshader",
  "shaderlab",
  "ink",
  "yarnspinner",
  "renpy",
  "url",
] as const;

export const CUSTOM_LANGUAGES: readonly CustomLanguage[] =
  CUSTOM_LANGUAGE_NAMES.map((name) => ({
    name,
    moduleName: name,
    path: `${import.meta.dir}/custom-languages/${name}.js`,
  }));

export type LanguageEntry = {
  name: string;
  moduleName: string;
  kind: "custom" | "hljs";
  customPath?: string;
};

function getModuleName(name: string) {
  let moduleName = name;

  if (STARTS_WITH_DIGIT.test(name)) moduleName = `_${name}`;
  if (CONTAINS_DASH.test(name)) moduleName = toCamelCase(name);

  return moduleName;
}

/**
 * Shipped language list: hljs built-ins not shadowed by a custom grammar,
 * plus customs, sorted by name. Shared with convert-grammars.ts.
 */
export function buildLanguageEntries(): LanguageEntry[] {
  const customNames = new Set(CUSTOM_LANGUAGES.map(({ name }) => name));

  return [
    ...hljs
      .listLanguages()
      .filter((name) => !customNames.has(name))
      .map((name) => ({
        name,
        moduleName: getModuleName(name),
        kind: "hljs" as const,
      })),
    ...CUSTOM_LANGUAGES.map(({ name, moduleName, path }) => ({
      name,
      moduleName,
      kind: "custom" as const,
      customPath: path,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));
}

export async function buildLanguages() {
  console.time("build languages");
  await $`rm -rf src/languages; mkdir src/languages`;

  const customLanguageContents = new Map<
    CustomLanguage["name"],
    CustomLanguage["path"]
  >(
    await Promise.all(
      CUSTOM_LANGUAGES.map(
        async ({ name, path }) => [name, await Bun.file(path).text()] as const,
      ),
    ),
  );

  const entries = buildLanguageEntries();

  let markdown = createMarkdown(
    "Languages",
    entries.length,
    CUSTOM_LANGUAGES.length,
  );
  let base = "";
  let baseTs = `
  import type { GrammarIR } from "../engine.d.ts";

  interface LanguageType<TName extends string> {
    name: TName;
    aliases?: string[];
    register: GrammarIR;
    /** Grammars this one embeds via \`subLanguage\` (e.g. astro -> html/typescript/css/javascript). */
    dependencies?: LanguageType<string>[];
  }\n\n`;

  let languageNamesUnion = "";
  const lang: ModuleNames = [];
  const files: Array<{ path: string; content: string }> = [];

  for (const entry of entries) {
    const { name, moduleName, kind } = entry;

    base += `export { default as ${moduleName} } from './${name}';\n`;
    baseTs += `export declare const ${moduleName}: LanguageType<"${name}">;\n`;
    languageNamesUnion += `  | "${name}"\n`;
    lang.push({ name, moduleName });

    if (kind === "custom") {
      markdown += `## ${name} (\`${moduleName}\`)

> Custom svelte-highlight language (not exported by highlight.js)

\`\`\`html
<script>
  // direct import (recommended)
  import ${moduleName} from "svelte-highlight/languages/${name}";

  // base import
  import { ${moduleName} } from "svelte-highlight/languages";
</script>
\`\`\`\n\n`;

      files.push({
        path: `src/languages/${name}.js`,
        content: customLanguageContents.get(name) ?? "",
      });
    } else {
      markdown += `## ${name} (\`${moduleName}\`)

\`\`\`html
<script>
  // direct import (recommended)
  import ${moduleName} from "svelte-highlight/languages/${name}";

  // base import
  import { ${moduleName} } from "svelte-highlight/languages";
</script>
\`\`\`\n\n`;

      files.push({
        path: `src/languages/${name}.js`,
        content: `import register from "highlight.js/lib/languages/${name}";\n
export const ${moduleName} = { name: "${name}", register };
export default ${moduleName};\n`,
      });
    }

    files.push({
      path: `src/languages/${name}.d.ts`,
      content: `export { ${moduleName} } from "./";
export { ${moduleName} as default } from "./";\n`,
    });
  }

  baseTs += `\n\nexport type LanguageName =\n${languageNamesUnion};`;

  files.push({ path: "src/languages/index.js", content: base });
  files.push({ path: "src/languages/index.d.ts", content: baseTs });
  files.push({ path: "SUPPORTED_LANGUAGES.md", content: markdown });

  // all.js: every grammar as a plain array for HighlightAuto default detect.
  // Avoids `import *` (biome noNamespaceImport) and can be code-split later.
  const allImports = entries
    .map((entry) => `import ${entry.moduleName} from "./${entry.name}.js";`)
    .join("\n");
  const allNames = entries.map((entry) => entry.moduleName).join(", ");
  files.push({
    path: "src/languages/all.js",
    content: `${allImports}\n\nexport default [${allNames}];\n`,
  });
  files.push({
    path: "src/languages/all.d.ts",
    content: `import type { LanguageType } from "./index.d.ts";\n\ndeclare const languages: LanguageType<string>[];\nexport default languages;\n`,
  });

  await Promise.all([
    ...files.map(({ path, content }) => writeTo(path, content)),
    Bun.write("www/data/languages.json", JSON.stringify(lang)),
  ]);
  console.timeEnd("build languages");
}

/**
 * Flat alias -> canonical grammar name table (`src/languages/aliases.js` /
 * `.d.ts`). Must run after `convertGrammars()`: aliases only land in each
 * `src/languages/<name>.js` module's `register` field once the grammar has
 * been converted, so this does a second pass importing those files fresh
 * rather than the already-imported (pre-conversion) barrel.
 */
export async function buildAliases() {
  console.time("build aliases");
  const entries = buildLanguageEntries();

  /** @type {Map<string, string>} */
  const aliasToCanonical = new Map<string, string>();

  function claim(alias: string, canonical: string) {
    const existing = aliasToCanonical.get(alias);
    if (existing !== undefined) {
      if (existing !== canonical) {
        console.log(
          `build-languages: alias "${alias}" claimed by "${existing}", ignoring "${canonical}"`,
        );
      }
      return;
    }
    aliasToCanonical.set(alias, canonical);
  }

  // Canonical names are claimed in a pass of their own, ahead of every
  // alias: a grammar's own name must always resolve to itself even if an
  // earlier grammar in the list happens to list that name as one of its
  // aliases (e.g. "django" aliases "jinja", but "jinja" the grammar must
  // still win "jinja" the word).
  for (const entry of entries) claim(entry.name.toLowerCase(), entry.name);

  // Cache-busting query: convertGrammars() already imported these files
  // (via the barrel, under an extensionless specifier resolving to the same
  // path) before rewriting them on disk, so an uncached re-import of the
  // plain path would return that stale, pre-conversion module. Fetched
  // concurrently, then claimed sequentially in list order (claim order is
  // what decides conflict winners, not import completion order).
  const mods = await Promise.all(
    entries.map(
      (entry) =>
        import(`../src/languages/${entry.name}.js?aliases-pass`) as Promise<{
          default?: { aliases?: string[] };
        }>,
    ),
  );
  entries.forEach((entry, index) => {
    for (const alias of mods[index]?.default?.aliases ?? [])
      claim(alias.toLowerCase(), entry.name);
  });

  const table = Object.fromEntries(aliasToCanonical);

  await writeTo(
    "src/languages/aliases.js",
    `/*!
 * Generated by scripts/build-languages.ts. Do not edit by hand.
 */
export const LANGUAGE_ALIASES = /** @type {import("./aliases.d.ts").LanguageAliases} */ (${JSON.stringify(table)});
`,
  );
  await writeTo(
    "src/languages/aliases.d.ts",
    `export type LanguageAliases = Readonly<Record<string, string>>;

/**
 * Maps a lowercased grammar name or alias (e.g. "ts", "typescript") to its
 * canonical grammar name. Every canonical name also maps to itself.
 */
export declare const LANGUAGE_ALIASES: LanguageAliases;
`,
  );
  console.timeEnd("build aliases");
}
