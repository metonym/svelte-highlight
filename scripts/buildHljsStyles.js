const fs = require('fs-extra');
const glob = require('glob');
const { toPascalCase } = require('./utils/toPascalCase');

async function buildHljsStyles() {
  const baseExport = [];

  await fs.remove('src/styles');
  await fs.remove('styles');
  await fs.mkdir('src/styles');
  await fs.mkdir('styles');

  glob('node_modules/highlight.js/styles/*.css', {}, async (error, files) => {
    if (error) {
      return;
    }

    files.forEach(async file => {
      const styleName = file
        .split('/')
        .pop()
        .replace('.css', '');
      let name = toPascalCase(styleName);

      if (['default'].includes(name)) {
        name = `_${name}`;
      }

      baseExport.push(`export { default as ${name} } from './${styleName}';`);
      const buffer = await fs.readFile(file);
      const content = buffer.toString();
      const exportee = [
        `const ${name} = \`<style>${content}</style>\`;\n`,
        `export default ${name};\n`
      ].join('\n');
      await fs.writeFile(`src/styles/${styleName}.js`, exportee);
      await fs.writeFile(`styles/${styleName}.css`, content);
    });

    baseExport.push('\n');
    await fs.writeFile('src/styles/index.js', baseExport.join('\n'));
  });
}

module.exports = { buildHljsStyles };
