import { $ } from "bun";
import hljs from "highlight.js";
import type { ModuleNames } from "./build-styles";
import { createMarkdown } from "./utils/create-markdown";
import { toCamelCase } from "./utils/to-pascal-case";
import { writeTo } from "./utils/write-to";

export async function buildLanguages() {
  console.time("build languages");
  await $`rm -rf src/styles; mkdir src/styles`;

  let languages = hljs.listLanguages();
  let markdown = createMarkdown("Languages", languages.length);
  let base = "";
  let baseTs = `
  import type { LanguageFn } from "highlight.js";
  
  interface LanguageType<TName extends string> {
    name: TName;
    register: LanguageFn;
  }\n\n`;

  let lang: ModuleNames = [];

  languages.forEach(async (name) => {
    let moduleName = name;

    if (/^[0-9]/.test(name)) moduleName = `_${name}`;
    if (/-/.test(name)) moduleName = toCamelCase(name);

    base += `export { default as ${moduleName} } from './${name}';\n`;
    baseTs += `export declare const ${moduleName}: LanguageType<"${name}">;\n`;
    lang.push({ name, moduleName });
    markdown += `## ${name} (\`${moduleName}\`)

\`\`\`html
<script>
  // direct import (recommended)
  import ${moduleName} from "svelte-highlight/languages/${name}";

  // base import
  import { ${moduleName} } from "svelte-highlight/languages";
<\/script>
\`\`\`\n\n`;
    await writeTo(
      `src/languages/${name}.js`,
      `import register from "highlight.js/lib/languages/${name}";\n
export const ${moduleName} = { name: "${name}", register };
export default ${moduleName};\n`,
    );

    await writeTo(
      `src/languages/${name}.d.ts`,
      `export { ${moduleName} } from "./";
export { ${moduleName} as default } from "./";\n`,
    );
  });

  await writeTo("src/languages/index.js", base);
  await writeTo("src/languages/index.d.ts", baseTs);
  await writeTo("SUPPORTED_LANGUAGES.md", markdown);

  // Don't format metadata used in docs.
  await Bun.write("www/data/languages.json", JSON.stringify(lang));
  console.timeEnd("build languages");
}
