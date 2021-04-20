const glob = require("glob");
const { toPascalCase } = require("./utils/to-pascal-case");
const fs = require("./utils/fs");
const { writeTo } = require("./utils/write-to");
const pkg = require("../package.json");

async function buildStyles() {
  let hljsStyles = glob.sync("node_modules/highlight.js/styles/*.css");
  let markdown = `# Supported Styles
  
> ${hljsStyles.length} styles exported from highlight.js@${pkg.dependencies["highlight.js"]}  
`;

  let types = "";
  let base = "";
  let styles = [];

  glob("node_modules/highlight.js/styles/!(*.css)", {}, (error, files) => {
    if (error) return;

    files.forEach(async (file) => {
      console.info('copying', file)
      await fs.copyFile(file, `src/styles/${file.split("/").pop()}`);
    });
  });

  hljsStyles.forEach(async (file) => {
    let name = file.split("/").pop().replace(".css", "");
    let moduleName = toPascalCase(name);

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

    const content = await fs.readFile(file, "utf-8");
    const exportee = `const ${moduleName} = \`<style>${content}</style>\`;\n
export default ${moduleName};\n`;

    await writeTo(
      `types/src/styles/${name}.d.ts`,
      `export { ${moduleName} as default } from "./";\n`
    );
    await writeTo(`src/styles/${name}.js`, exportee);
    await writeTo(`src/styles/${name}.css`, content);
  });

  await writeTo("src/styles/index.js", base);
  await writeTo("SUPPORTED_STYLES.md", markdown);
  await writeTo("types/src/styles/index.d.ts", types);
  await writeTo("demo/src/lib/styles.json", styles);
}

module.exports = { buildStyles };
