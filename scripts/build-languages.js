const hljs = require("highlight.js");
const { toPascalCase } = require("./utils/to-pascal-case");
const fs = require("./utils/fs");
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

  languages.forEach(async (language) => {
    const languageNameStartsWithNumber = language
      .slice(0, 1)
      .match(new RegExp(/[0-9]/g));
    const languageNameHasDash = language.match(new RegExp(/-/g));

    let moduleName = language;

    if (languageNameStartsWithNumber) {
      moduleName = ["_", language].join("");
    }

    if (languageNameHasDash) {
      moduleName = toPascalCase(language);
    }

    types += `export const ${moduleName}: HljsLanguage & { name: "${language}"; };\n\n`;
    base += `export { default as ${moduleName} } from './${language}';\n`;
    lang.push({ name: language, moduleName });
    markdown += `## ${language} (\`${moduleName}\`)

\`\`\`html
<script>
  // base import
  import { ${moduleName} } from "svelte-highlight/src/languages";
  
  // direct import
  import ${moduleName} from "svelte-highlight/src/languages/${language}";
<\/script>
\`\`\`\n\n`;

    await fs.writeFile(
      `types/src/languages/${moduleName}.d.ts`,
      `export { ${moduleName} as default } from "./";\n`
    );
    await fs.writeFile(
      `src/languages/${language}.js`,
      `import ${moduleName} from "highlight.js/lib/languages/${language}.js";\n
export default { name: "${language}", register: ${moduleName} };\n`
    );
  });

  await fs.writeFile("src/languages/index.js", base);
  await fs.writeFile("types/src/languages/index.d.ts", types);
  await fs.writeFile("SUPPORTED_LANGUAGES.md", markdown);
  await fs.writeFile(
    "demo/src/lib/languages.json",
    JSON.stringify(lang, null, 2)
  );
}

module.exports = { buildLanguages };
