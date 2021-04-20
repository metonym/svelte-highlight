const hljs = require("highlight.js");
const { toPascalCase } = require("./utils/to-pascal-case");
const fs = require("./utils/fs");

async function buildLanguages() {
  const md = ["# Supported Languages\n"];
  const languages = hljs.listLanguages();
  const baseExport = [];

  let types = `interface HljsLanguage {
  register: (hljs: any) => Record<string, any>;
}\n\n`;

  let base = "";
  let lang = [];

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
    lang.push({
      name: language,
      moduleName: exportee,
    });

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

  await fs.writeFile("src/languages/index.js", base);

  md.push("\n");

  await fs.writeFile("SUPPORTED_LANGUAGES.md", md.join("\n"));
  await fs.writeFile("types/src/languages/index.d.ts", types);
  await fs.writeFile(
    "demo/src/lib/languages.json",
    JSON.stringify(lang, null, 2)
  );
}

module.exports = { buildLanguages };
