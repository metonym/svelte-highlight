const glob = require("glob");
const { toPascalCase } = require("./utils/toPascalCase");
const fs = require("./utils/fs");

const deprecatedStyles = ["darkula"];

async function buildHljsStyles() {
  const baseExport = [];

  await fs.rmdir("src/styles", { recursive: true });
  await fs.rmdir("styles", { recursive: true });
  await fs.mkdir("src/styles");
  await fs.mkdir("styles");

  const md = ["# Supported Styles\n"];

  glob("node_modules/highlight.js/styles/!(*.css)", {}, (error, files) => {
    if (error) return;

    files.forEach(async (file) => {
      await fs.copyFile(file, `styles/${file.split("/").pop()}`, file);
    });
  });

  glob("node_modules/highlight.js/styles/*.css", {}, async (error, files) => {
    if (error) return;

    files.forEach(async (file) => {
      const styleName = file.split("/").pop().replace(".css", "");
      let name = toPascalCase(styleName);

      if (deprecatedStyles.includes(name)) {
        return;
      }

      if (["default"].includes(name)) {
        name = `_${name}`;
      }

      md.push(`## ${styleName} (\`${name}\`)\n`);
      md.push("<details>");
      md.push("<summary>Usage</summary>\n");
      md.push("### CSS Stylesheet\n");
      md.push("```html");
      md.push("<script>");
      md.push(`  import 'svelte-highlight/styles/${styleName}.css';`);
      md.push("</script>");
      md.push("```\n");
      md.push("### JavaScript\n");
      md.push("```html");
      md.push("<script>");
      md.push(`  import { ${name} } from 'svelte-highlight/styles';`);
      md.push("</script>\n");
      md.push("<svelte:head>");
      md.push(`  {@html ${name}}`);
      md.push("</svelte:head>");
      md.push("```");
      md.push("</details>\n");

      baseExport.push(`export { default as ${name} } from './${styleName}';`);
      const content = await fs.readFile(file, "utf-8");
      const exportee = [
        `const ${name} = \`<style>${content}</style>\`;\n`,
        `export default ${name};\n`,
      ].join("\n");
      await fs.writeFile(`src/styles/${styleName}.js`, exportee);
      await fs.writeFile(`styles/${styleName}.css`, content);
    });

    baseExport.push("\n");
    await fs.writeFile("src/styles/index.js", baseExport.join("\n"));

    md.push("\n");
    await fs.writeFile("docs/SUPPORTED_STYLES.md", md.join("\n"));
  });
}

module.exports = { buildHljsStyles };
