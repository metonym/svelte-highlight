const shx = require('shelljs');
const fs = require('fs-extra');
const hljs = require('highlight.js');

async function build() {
  shx.rm('-rf', ['src/languages', 'languages', 'lib', 'styles']);
  shx.cp('-r', 'node_modules/highlight.js/styles', 'styles');

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
      exportee = language
        .split('-')
        .map((fragment, index) => {
          if (index === 0) {
            return fragment;
          }

          return [fragment.slice(0, 1).toUpperCase(), fragment.slice(1)].join('');
        })
        .join('');
    }

    baseExport.push(`export { default as ${exportee} } from './${language}';`);

    return [
      `import ${exportee} from 'highlight.js/lib/languages/${language}';`,
      '\n\n',
      `export default { name: '${language}', register: ${exportee} };`,
      '\n'
    ].join('');
  });

  await fs.mkdir('src/languages');

  baseExport.push('\n');
  await fs.writeFile('src/languages/index.js', baseExport.join('\n'));

  files.forEach(async (file, index) => {
    await fs.writeFile(`src/languages/${languages[index]}.js`, file);
  });
}

export { build };
