const hljs = require("highlight.js");
const { toPascalCase } = require("./utils/to-pascal-case");
const { writeTo } = require("./utils/write-to");
const pkg = require("../package.json");

async function buildLanguages() {
  let languages = hljs.listLanguages();
  let markdown = `# Supported Languages
  
> ${languages.length} languages exported from highlight.js@${pkg.dependencies["highlight.js"]}  
`;

  let types = `interface HljsLanguage {
  register: (hljs: any) => Record<string, any>;
}\n\n`;

  let base = "";
  let lang = [];

  languages.forEach(async (name) => {
    let moduleName = name;

    if (/^[0-9]/.test(name)) moduleName = `_${name}`;
    if (/-/.test(name)) moduleName = toPascalCase(name);

    types += `export const ${moduleName}: HljsLanguage & { name: "${name}"; };\n\n`;
    base += `export { default as ${moduleName} } from './${name}';\n`;
    lang.push({ name, moduleName });
    markdown += `## ${name} (\`${moduleName}\`)

\`\`\`html
<script>
  // base import
  import { ${moduleName} } from "svelte-highlight/src/languages";
  
  // direct import
  import ${moduleName} from "svelte-highlight/src/languages/${name}";
<\/script>
\`\`\`\n\n`;

    await writeTo(
      `types/src/languages/${moduleName}.d.ts`,
      `export { ${moduleName} as default } from "./";\n`
    );
    await writeTo(
      `src/languages/${name}.js`,
      `import ${moduleName} from "highlight.js/lib/languages/${name}.js";\n
export default { name: "${name}", register: ${moduleName} };\n`
    );
  });

  await writeTo("src/languages/index.js", base);
  await writeTo("types/src/languages/index.d.ts", types);
  await writeTo("SUPPORTED_LANGUAGES.md", markdown);
  await writeTo("demo/src/lib/languages.json", lang);
}

module.exports = { buildLanguages };
