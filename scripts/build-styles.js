import { totalist } from "totalist";
import path from "path";
import { readFile, copyFile } from "./utils/fs.js";
import { writeTo } from "./utils/write-to.js";
import { toCamelCase } from "./utils/to-pascal-case.js";
import { createMarkdown } from "./utils/create-markdown.js";

export async function buildStyles() {
  let names = [];
  let styles = [];

  await totalist("node_modules/highlight.js/styles", async (file, absPath) => {
    if (/\.(css)$/.test(file)) {
      let { name, dir } = path.parse(file);
      let moduleName = toCamelCase(name);

      if (/^[0-9]/.test(moduleName) || /^default$/.test(moduleName)) {
        moduleName = `_${moduleName}`;
      }

      if (names.includes(name)) {
        name = `${dir}-${name}`;
        moduleName = toCamelCase(name);
      }

      names.push(name);
      styles.push({ name, moduleName });

      const content = await readFile(absPath, "utf-8");
      const exportee = `const ${moduleName} = \`<style>${content.replace(
        /\`/g,
        "\\`"
      )}</style>\`;\n
      export default ${moduleName};\n`;

      await writeTo(
        `types/src/styles/${name}.d.ts`,
        `export { ${moduleName} as default } from "./";\n`
      );
      await writeTo(`src/styles/${name}.js`, exportee);
      await writeTo(`src/styles/${name}.css`, content);
    } else {
      await copyFile(absPath, `src/styles/${file}`);
    }
  });

  styles = styles.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });

  const markdown =
    createMarkdown("Styles", styles.length) +
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

  const types = styles
    .map((style) => `export const ${style.moduleName}: string;\n`)
    .join("");
  const base = styles
    .map(
      (style) =>
        `export { default as ${style.moduleName} } from './${style.name}';\n`
    )
    .join("");

  await writeTo("src/styles/index.js", base);
  await writeTo("SUPPORTED_STYLES.md", markdown);
  await writeTo("types/src/styles/index.d.ts", types);
  await writeTo("demo/lib/styles.json", styles);
}
