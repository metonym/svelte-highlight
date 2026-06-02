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

const CUSTOM_LANGUAGES: readonly CustomLanguage[] = [
  {
    name: "html",
    moduleName: "html",
    path: `${import.meta.dir}/custom-languages/html.js`,
  },
  {
    name: "astro",
    moduleName: "astro",
    path: `${import.meta.dir}/custom-languages/astro.js`,
  },
  {
    name: "svelte",
    moduleName: "svelte",
    path: `${import.meta.dir}/custom-languages/svelte.js`,
  },
];

type LanguageEntry = {
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

  const customNames = new Set(CUSTOM_LANGUAGES.map(({ name }) => name));

  const entries: LanguageEntry[] = [
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

  let markdown = createMarkdown("Languages", entries.length);
  let base = "";
  let baseTs = `
  import type { LanguageFn } from "highlight.js";

  interface LanguageType<TName extends string> {
    name: TName;
    register: LanguageFn;
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

  await Promise.all([
    ...files.map(({ path, content }) => writeTo(path, content)),
    Bun.write("www/data/languages.json", JSON.stringify(lang)),
  ]);
  console.timeEnd("build languages");
}
