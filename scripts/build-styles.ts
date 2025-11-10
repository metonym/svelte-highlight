import path from "node:path";
import { $, Glob } from "bun";
import { createMarkdown } from "./utils/create-markdown";
import { postcssScopedStyles } from "./utils/postcss-scoped-styles";
import { preprocessStyles } from "./utils/preprocess-styles";
import { toCamelCase } from "./utils/to-camel-case";
import { writeTo } from "./utils/write-to";

export type ModuleNames = Array<{ name: string; moduleName: string }>;

export async function buildStyles() {
  console.time("build styles");
  await $`rm -rf src/styles; mkdir src/styles`;

  let scopedStyles = "";
  const names: string[] = [];
  let styles: ModuleNames = [];

  const glob = new Glob("**/*");

  for await (const file of glob.scan("node_modules/highlight.js/styles")) {
    const absPath = path.resolve("node_modules/highlight.js/styles", file);
    if (/(?<!\.min)\.(css)$/.test(file)) {
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

      const content = await Bun.file(absPath).text();
      const cssMinified = preprocessStyles(content, {
        discardComments: "preserve-license",
      });

      // Escape backticks for JS template literal.
      const contentCssForJs = preprocessStyles(content.replace(/`/g, "\\`"), {
        discardComments: "preserve-license",
      });

      const exportee = `const ${moduleName} = \`<style>${contentCssForJs}</style>\`;\n
      export default ${moduleName};\n`;

      await writeTo(`src/styles/${name}.js`, exportee);
      await writeTo(
        `src/styles/${name}.d.ts`,
        `export { ${moduleName} as default } from "./";\n`,
      );
      await writeTo(`src/styles/${name}.css`, cssMinified);

      const scopedStyle = preprocessStyles(content, {
        discardComments: "remove-all",
        plugins: [postcssScopedStyles(moduleName)],
      });

      scopedStyles += scopedStyle;
    } else {
      // Copy over other file types, like images.
      if (!/\.(css)$/.test(file)) {
        await $`cp ${absPath} src/styles/`;
      }
    }
  }

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
  import ${moduleName} from "svelte-highlight/styles/${moduleName}";
</script>

<svelte:head>
  {@html ${moduleName}}
</svelte:head>
\`\`\`\n\n

**CSS StyleSheet**

\`\`\`html
<script>
  import "svelte-highlight/styles/${name}.css";
</script>
\`\`\`\n\n`;
      })
      .join("");

  const types = styles
    .map((style) => `export declare const ${style.moduleName}: string;\n`)
    .join("");
  const base = styles
    .map(
      (style) =>
        `export { default as ${style.moduleName} } from './${style.name}';\n`,
    )
    .join("");

  await writeTo("src/styles/index.js", base);
  await writeTo("src/styles/index.d.ts", types);
  await writeTo("SUPPORTED_STYLES.md", markdown);

  // Don't format metadata used in docs.
  await Bun.write("www/data/styles.json", JSON.stringify(styles));
  await Bun.write("www/data/scoped-styles.css", scopedStyles);

  console.timeEnd("build styles");
}
