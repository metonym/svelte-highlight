import path from "node:path";
import { $, Glob } from "bun";
import { createMarkdown } from "./utils/create-markdown.ts";
import { fillSimilarityGaps } from "./utils/fill-similarity-gaps.ts";
import { inlineCssUrls } from "./utils/inline-css-urls.ts";
import { preprocessStyles } from "./utils/preprocess-styles.ts";
import {
  BACKTICK,
  DEFAULT_STRING,
  NON_MINIFIED_CSS,
  STARTS_WITH_DIGIT,
} from "./utils/regexes.ts";
import { scopeStylesheet } from "./utils/scope-stylesheet.ts";
import { buildGapFillProposals } from "./utils/similarity-map.ts";
import { toCamelCase } from "./utils/to-camel-case.ts";
import { writeTo } from "./utils/write-to.ts";

export type ModuleNames = Array<{ name: string; moduleName: string }>;

export async function buildStyles() {
  console.time("build styles");
  await $`rm -rf src/styles; mkdir src/styles`;

  let scopedStyles = "";
  const seenNames = new Set<string>();
  let styles: ModuleNames = [];

  const glob = new Glob("**/*");

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

      if (seenNames.has(name)) {
        name = `${dir}-${name}`;
        moduleName = toCamelCase(name);
      }

      seenNames.add(name);
      styles.push({ name, moduleName });
      cssFiles.push({ file, absPath, name, dir, moduleName });
    }
  }

  // Mining gap-fill proposals needs every theme's raw CSS up front, so read
  // it all once here rather than per-file inside the main pass below.
  const rawContents = await Promise.all(
    cssFiles.map(({ absPath }) => Bun.file(absPath).text()),
  );
  const rawCssByTheme = new Map(
    cssFiles.map(({ name }, i) => [name, rawContents[i]]),
  );
  const gapFillProposals = buildGapFillProposals(rawCssByTheme);

  const fileWrites = await Promise.all(
    cssFiles.map(async ({ absPath, name, moduleName }, i) => {
      const raw = rawContents[i];
      const content = await inlineCssUrls(raw, path.dirname(absPath));

      const proposals = gapFillProposals.get(name);
      const plugins =
        proposals && proposals.size > 0 ? [fillSimilarityGaps(proposals)] : [];

      const cssMinified = preprocessStyles(content, {
        discardComments: "preserve-license",
        plugins,
      });
      const contentCssForJs = cssMinified.replace(BACKTICK, "\\`");

      const exportee = `const ${moduleName} = \`<style>${contentCssForJs}</style>\`;\n
      export default ${moduleName};\n`;

      // Scope each theme for docs previews (`class={moduleName}` on the `<pre>`).
      const scopedStyle = scopeStylesheet(
        preprocessStyles(content, { discardComments: "remove-all", plugins }),
        moduleName,
      );

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

  styles = styles.sort((a, b) => a.name.localeCompare(b.name));

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
