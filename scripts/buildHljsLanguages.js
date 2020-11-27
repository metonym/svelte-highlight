const hljs = require("highlight.js");
const { toPascalCase } = require("./utils/toPascalCase");
const fs = require("./utils/fs");

async function buildHljsLanguages() {
  const md = ["# Supported Languages\n"];
  const languages = hljs.listLanguages();
  const baseExport = [];

  const files = languages.map((language) => {
    const languageNameStartsWithNumber = language.slice(0, 1).match(new RegExp(/[0-9]/g));
    const languageNameHasDash = language.match(new RegExp(/-/g));

    let exportee = language;

    if (languageNameStartsWithNumber) {
      exportee = ["_", language].join("");
    }

    if (languageNameHasDash) {
      exportee = toPascalCase(language);
    }

    md.push(`## ${language} (\`${exportee}\`)\n`);
    md.push("<details>");
    md.push("<summary>Usage</summary>\n");
    md.push("```html");
    md.push("<script>");
    md.push(`  import { ${exportee} } from 'svelte-highlight/languages';`);
    md.push("</script>");
    md.push("```");
    md.push("</details>\n");

    baseExport.push(`export { default as ${exportee} } from './${language}';`);

    return [
      `import ${exportee} from 'highlight.js/lib/languages/${language}';\n`,
      `export default { name: '${language}', register: ${exportee} };\n`,
    ].join("\n");
  });

  baseExport.push("\n");
  await fs.writeFile("dist/languages/index.js", baseExport.join("\n"));

  files.forEach(async (file, index) => {
    await fs.writeFile(`dist/languages/${languages[index]}.js`, file);
  });

  md.push("\n");

  await fs.writeFile("SUPPORTED_LANGUAGES.md", md.join("\n"));
}

module.exports = { buildHljsLanguages };
