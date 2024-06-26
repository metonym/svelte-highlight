import { $, Glob } from "bun";
import path from "node:path";
import { createMarkdown } from "./utils/create-markdown";
import { minifyCss } from "./utils/minify-css";
import { toCamelCase } from "./utils/to-pascal-case";
import { writeTo } from "./utils/write-to";

export type ModuleNames = Array<{ name: string; moduleName: string }>;

export async function buildStyles() {
  console.time("build styles");
  await $`rm -rf src/styles; mkdir src/styles`;

  let scoped_styles = "";
  let names: string[] = [];
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
      const css_minified = minifyCss(content);

      // Escape backticks for JS template literal.
      const content_css_for_js = minifyCss(content.replace(/\`/g, "\\`"), {
        remove: (comment) => {
          if (/(License|Author)/i.test(comment)) {
            // Preserve license comments.
            return false;
          }

          return true;
        },
      });

      const exportee = `const ${moduleName} = \`<style>${content_css_for_js}</style>\`;\n
      export default ${moduleName};\n`;

      await writeTo(`src/styles/${name}.js`, exportee);
      await writeTo(
        `src/styles/${name}.d.ts`,
        `export { ${moduleName} as default } from "./";\n`,
      );
      await writeTo(`src/styles/${name}.css`, css_minified);

      const scoped_style = content
        .replace(/\.hljs/g, `.${moduleName} .hljs`)
        // adjust for first two rules being `code.hljs` not `.hljs`
        .replace(/\s?code\.[_0-9a-zA-Z]+\s\.hljs/g, `.${moduleName} code.hljs`);

      scoped_styles += scoped_style;
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
<\/script>

<svelte:head>
  {@html ${moduleName}}
<\/svelte:head>
\`\`\`\n\n

**CSS StyleSheet**

\`\`\`html
<script>
  import "svelte-highlight/styles/${name}.css";
<\/script>
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
  await writeTo("www/data/styles.json", styles);
  await writeTo(
    "www/data/scoped-styles.css",
    minifyCss(scoped_styles, { removeAll: true }),
  );
  console.timeEnd("build styles");
}
