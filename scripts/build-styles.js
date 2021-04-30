const { totalist } = require("totalist");
const path = require("path");
const utils = require("./utils");

async function buildStyles() {
  let names = [];
  let types = "";
  let base = "";
  let styles = [];

  await totalist("node_modules/highlight.js/styles", async (file, absPath) => {
    if (/\.(css)$/.test(file)) {
      let { name, dir } = path.parse(file);
      let moduleName = utils.toPascalCase(name);

      if (/^[0-9]/.test(moduleName) || /^default$/.test(moduleName)) {
        moduleName = `_${moduleName}`;
      }

      if (names.includes(name)) {
        name = `${dir}-${name}`;
        moduleName = utils.toPascalCase(name);
      }

      names.push(name);

      types += `export const ${moduleName}: string;\n`;
      base += `export { default as ${moduleName} } from './${name}';`;
      styles.push({ name, moduleName });

      const content = await utils.fs.readFile(absPath, "utf-8");
      const exportee = `const ${moduleName} = \`<style>${content}</style>\`;\n
      export default ${moduleName};\n`;

      await utils.writeTo(
        `types/src/styles/${name}.d.ts`,
        `export { ${moduleName} as default } from "./";\n`
      );
      await utils.writeTo(`src/styles/${name}.js`, exportee);
      await utils.writeTo(`src/styles/${name}.css`, content);
    } else {
      await utils.fs.copyFile(absPath, `src/styles/${file}`);
    }
  });

  styles = styles.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });

  const markdown =
    utils.createMarkdown("Styles", styles.length) +
    styles
      .map(({ name, moduleName }) => {
        return `## ${name} (\`${moduleName}\`)

**Injected Styles**

\`\`\`html
<script>
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
      })
      .join("");

  await utils.writeTo("src/styles/index.js", base);
  await utils.writeTo("SUPPORTED_STYLES.md", markdown);
  await utils.writeTo("types/src/styles/index.d.ts", types);
  await utils.writeTo("demo/src/lib/styles.json", styles);
}

module.exports = { buildStyles };
