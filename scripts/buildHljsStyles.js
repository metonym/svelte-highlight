const fs = require('fs-extra');
const glob = require('glob');
const { toPascalCase } = require('./utils/toPascalCase');

async function buildHljsStyles() {
  const baseExport = [];

  await fs.remove('src/styles');
  await fs.remove('styles');
  await fs.mkdir('src/styles');
  await fs.mkdir('styles');

  const supportedStyles = ['# Supported Styles\n'];

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

      supportedStyles.push(`- ${styleName} (\`${name}\`)`);

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

    supportedStyles.push('\n');
    await fs.writeFile('SUPPORTED_STYLES.md', supportedStyles.join('\n'));
  });
}

module.exports = { buildHljsStyles };
