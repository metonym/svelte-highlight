const glob = require("glob");
const utils = require("./utils");

async function buildStyles() {
  let hljsStyles = glob.sync("node_modules/highlight.js/styles/*.css");
  let markdown = utils.createMarkdown("Styles", hljsStyles.length);
  let types = "";
  let base = "";
  let styles = [];

  glob("node_modules/highlight.js/styles/!(*.css)", {}, (error, files) => {
    if (error) return;

    files.forEach(async (file) => {
      console.info("copying", file);
      await utils.fs.copyFile(file, `src/styles/${file.split("/").pop()}`);
    });
  });

  hljsStyles.forEach(async (file) => {
    let name = file.split("/").pop().replace(".css", "");
    let moduleName = utils.toPascalCase(name);

    if (/^default$/.test(moduleName)) moduleName = `_${moduleName}`;

    types += `export const ${moduleName}: string;\n`;
    base += `export { default as ${moduleName} } from './${name}';`;
    styles.push({ name, moduleName });
    markdown += `## ${name} (\`${moduleName}\`)

**Injected Styles**

\`\`\`html
<script>
// base import
import { ${moduleName} } from "svelte-highlight/src/styles";

// direct import
import ${moduleName} from "svelte-highlight/src/styles/${moduleName}";
<\/script>

<svelte:head>
{@html ${moduleName}}
<\/svelte:head>
\`\`\`\n\n

**CSS StyleSheet**

\`\`\`html
<script>
import "svelte-highlight/src/languages/${name}.css";
<\/script>
\`\`\`\n\n`;

    const content = await utils.fs.readFile(file, "utf-8");
    const exportee = `const ${moduleName} = \`<style>${content}</style>\`;\n
export default ${moduleName};\n`;

    await utils.writeTo(
      `types/src/styles/${name}.d.ts`,
      `export { ${moduleName} as default } from "./";\n`
    );
    await utils.writeTo(`src/styles/${name}.js`, exportee);
    await utils.writeTo(`src/styles/${name}.css`, content);
  });

  await utils.writeTo("src/styles/index.js", base);
  await utils.writeTo("SUPPORTED_STYLES.md", markdown);
  await utils.writeTo("types/src/styles/index.d.ts", types);
  await utils.writeTo("demo/src/lib/styles.json", styles);
}

module.exports = { buildStyles };
