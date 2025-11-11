import path from "node:path";
import { $, Glob } from "bun";
import { createMarkdown } from "./utils/create-markdown";
import { postcssScopedStyles } from "./utils/postcss-scoped-styles";
import { preprocessStyles } from "./utils/preprocess-styles";
import {
  BACKTICK,
  CSS_FILE,
  DEFAULT_STRING,
  NON_MINIFIED_CSS,
  STARTS_WITH_DIGIT,
} from "./utils/regexes";
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
  const copyCommands: string[] = [];

  const cssFiles: Array<{
    file: string;
    absPath: string;
    name: string;
    dir: string;
    moduleName: string;
  }> = [];

  for await (const file of glob.scan("node_modules/highlight.js/styles")) {
    const absPath = path.resolve("node_modules/highlight.js/styles", file);
    if (NON_MINIFIED_CSS.test(file)) {
      let { name, dir } = path.parse(file);
      let moduleName = toCamelCase(name);

      if (
        STARTS_WITH_DIGIT.test(moduleName) ||
        DEFAULT_STRING.test(moduleName)
      ) {
        moduleName = `_${moduleName}`;
      }

      if (names.includes(name)) {
        name = `${dir}-${name}`;
        moduleName = toCamelCase(name);
      }

      names.push(name);
      styles.push({ name, moduleName });
      cssFiles.push({ file, absPath, name, dir, moduleName });
    } else {
      if (!CSS_FILE.test(file)) {
        copyCommands.push(absPath);
      }
    }
  }

  if (copyCommands.length > 0) {
    await Promise.all(
      copyCommands.map((absPath) => $`cp ${absPath} src/styles/`),
    );
  }

  const fileWrites = await Promise.all(
    cssFiles.map(async ({ absPath, name, moduleName }) => {
      const content = await Bun.file(absPath).text();

      const cssMinified = preprocessStyles(content, {
        discardComments: "preserve-license",
      });
      const contentCssForJs = cssMinified.replace(BACKTICK, "\\`");

      const exportee = `const ${moduleName} = \`<style>${contentCssForJs}</style>\`;\n
      export default ${moduleName};\n`;

      const scopedStyle = preprocessStyles(content, {
        discardComments: "remove-all",
        plugins: [postcssScopedStyles(moduleName)],
      });

      return {
        writes: [
          writeTo(`src/styles/${name}.js`, exportee),
          writeTo(
            `src/styles/${name}.d.ts`,
            `export { ${moduleName} as default } from "./";\n`,
          ),
          writeTo(`src/styles/${name}.css`, cssMinified),
        ],
        scopedStyle,
      };
    }),
  );

  const allWrites: Promise<void>[] = [];
  for (const { writes, scopedStyle } of fileWrites) {
    allWrites.push(...writes);
    scopedStyles += scopedStyle;
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

  allWrites.push(writeTo("src/styles/index.js", base));
  allWrites.push(writeTo("src/styles/index.d.ts", types));
  allWrites.push(writeTo("SUPPORTED_STYLES.md", markdown));
  allWrites.push(
    Bun.write("www/data/styles.json", JSON.stringify(styles)).then(() => {}),
  );
  allWrites.push(
    Bun.write("www/data/scoped-styles.css", scopedStyles).then(() => {}),
  );

  await Promise.all(allWrites);

  console.timeEnd("build styles");
}
