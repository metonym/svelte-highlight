const fs = require("fs");
const glob = require("glob");
const { toPascalCase } = require("./utils/toPascalCase");

const deprecatedStyles = ["darkula"];

function buildHljsStyles() {
  const baseExport = [];

  fs.rmdirSync("src/styles", { recursive: true });
  fs.rmdirSync("styles", { recursive: true });
  fs.mkdirSync("src/styles");
  fs.mkdirSync("styles");

  const md = ["# Supported Styles\n"];

  glob("node_modules/highlight.js/styles/!(*.css)", {}, (error, files) => {
    if (error) return;

    files.forEach((file) => {
      fs.copyFileSync(file, `styles/${file.split("/").pop()}`, file);
    });
  });

  glob("node_modules/highlight.js/styles/*.css", {}, (error, files) => {
    if (error) return;

    files.forEach((file) => {
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
      md.push(`  import 'svelte-highlight/styles/${name}.css';`);
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
      const content = fs.readFileSync(file).toString();
      const exportee = [
        `const ${name} = \`<style>${content}</style>\`;\n`,
        `export default ${name};\n`,
      ].join("\n");
      fs.writeFileSync(`src/styles/${styleName}.js`, exportee);
      fs.writeFileSync(`styles/${styleName}.css`, content);
    });

    baseExport.push("\n");
    fs.writeFileSync("src/styles/index.js", baseExport.join("\n"));

    md.push("\n");
    fs.writeFileSync("docs/SUPPORTED_STYLES.md", md.join("\n"));
  });
}

module.exports = { buildHljsStyles };
