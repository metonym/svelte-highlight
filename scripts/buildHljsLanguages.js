const hljs = require("highlight.js");
const { toPascalCase } = require("./utils/toPascalCase");
const fs = require("./utils/fs");

async function buildHljsLanguages() {
  const md = ["# Supported Languages\n"];
  const languages = hljs.listLanguages();
  const baseExport = [];

  let types = `interface HljsLanguage {
  register: (hljs: any) => Record<string, any>;
}\n\n`;

  let base = "";

  const files = languages.map(async (language) => {
    const languageNameStartsWithNumber = language
      .slice(0, 1)
      .match(new RegExp(/[0-9]/g));
    const languageNameHasDash = language.match(new RegExp(/-/g));

    let exportee = language;

    if (languageNameStartsWithNumber) {
      exportee = ["_", language].join("");
    }

    if (languageNameHasDash) {
      exportee = toPascalCase(language);
    }

    types += `export const ${exportee}: HljsLanguage & {
  name: "${language}";
};\n\n`;

    base += `export { default as ${exportee} } from './${language}';`;

    md.push(`## ${language} (\`${exportee}\`)\n`);
    md.push("<details>");
    md.push("<summary>Usage</summary>\n");
    md.push("```html");
    md.push("<script>");
    md.push(`  import { ${exportee} } from 'svelte-highlight/src/languages';`);
    md.push("</script>");
    md.push("```");
    md.push("</details>\n");

    baseExport.push(`export { default as ${exportee} } from './${language}';`);
    await fs.writeFile(
      `types/src/languages/${exportee}.d.ts`,
      `export { ${exportee} as default } from "./";\n`
    );
    await fs.writeFile(
      `src/languages/${language}.js`,
      [
        `import ${exportee} from 'highlight.js/lib/languages/${language}.js';\n`,
        `export default { name: '${language}', register: ${exportee} };\n`,
      ].join("\n")
    );

    return [
      `import ${exportee} from 'highlight.js/lib/languages/${language}.js';\n`,
      `export default { name: '${language}', register: ${exportee} };\n`,
    ].join("\n");
  });

  baseExport.push("\n");

  // console.log("base", base);
  await fs.writeFile("src/languages/index.js", base);

  files.forEach(async (file, index) => {
    // console.log(file);
    // await fs.writeFile(`src/languages/${languages[index]}.js`, file);
  });

  md.push("\n");

  await fs.writeFile("SUPPORTED_LANGUAGES.md", md.join("\n"));
  await fs.writeFile("types/src/languages/index.d.ts", types);
}

module.exports = { buildHljsLanguages };
