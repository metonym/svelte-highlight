import { $ } from "bun";
import hljs from "highlight.js";
import type { ModuleNames } from "./build-styles";
import { createMarkdown } from "./utils/create-markdown";
import { toCamelCase } from "./utils/to-camel-case";
import { writeTo } from "./utils/write-to";

export async function buildLanguages() {
  console.time("build languages");
  await $`rm -rf src/languages; mkdir src/languages`;

  const languages = hljs.listLanguages();
  let markdown = createMarkdown("Languages", languages.length);
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

  for (const name of languages) {
    let moduleName = name;

    if (/^[0-9]/.test(name)) moduleName = `_${name}`;
    if (/-/.test(name)) moduleName = toCamelCase(name);

    base += `export { default as ${moduleName} } from './${name}';\n`;
    baseTs += `export declare const ${moduleName}: LanguageType<"${name}">;\n`;
    languageNamesUnion += `  | "${name}"\n`;
    lang.push({ name, moduleName });
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
