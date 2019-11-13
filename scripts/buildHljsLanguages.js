const fs = require('fs-extra');
const hljs = require('highlight.js');
const { toPascalCase } = require('./utils/toPascalCase');

async function buildHljsLanguages() {
  await fs.remove('src/languages');
  await fs.remove('languages');
  await fs.mkdir('src/languages');
  await fs.mkdir('languages');

  const languages = hljs.listLanguages();
  const baseExport = [];

  const files = languages.map(language => {
    const languageNameStartsWithNumber = language.slice(0, 1).match(new RegExp(/[0-9]/g));
    const languageNameHasDash = language.match(new RegExp(/-/g));

    let exportee = language;

    if (languageNameStartsWithNumber) {
      exportee = ['_', language].join('');
    }

    if (languageNameHasDash) {
      exportee = toPascalCase(language);
    }

    baseExport.push(`export { default as ${exportee} } from './${language}';`);

    return [
      `import ${exportee} from 'highlight.js/lib/languages/${language}';\n`,
      `export default { name: '${language}', register: ${exportee} };\n`
    ].join('\n');
  });

  baseExport.push('\n');
  await fs.writeFile('src/languages/index.js', baseExport.join('\n'));

  files.forEach(async (file, index) => {
    await fs.writeFile(`src/languages/${languages[index]}.js`, file);
  });
}

module.exports = { buildHljsLanguages };