import { toCamelCase } from "./utils/to-camel-case.ts";

const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const rawName = process.argv[2];
const rawDisplayName = process.argv[3];

if (!rawName || !rawDisplayName) {
  console.error('usage: bun scripts/add-language.ts <name> "<Display Name>"');
  process.exit(1);
}

const name: string = rawName;
const displayName: string = rawDisplayName;

if (!NAME_PATTERN.test(name)) {
  console.error(
    `error: <name> must be lowercase [a-z][a-z0-9-]*, got: ${JSON.stringify(name)}`,
  );
  process.exit(1);
}

const grammarPath = `scripts/custom-languages/${name}.js`;

if (await Bun.file(grammarPath).exists()) {
  console.error(`error: ${grammarPath} already exists`);
  process.exit(1);
}

const buildLanguagesPath = "scripts/build-languages.ts";
const buildLanguagesSource = await Bun.file(buildLanguagesPath).text();

if (buildLanguagesSource.includes(`"${name}"`)) {
  console.error(
    `error: "${name}" already appears in CUSTOM_LANGUAGE_NAMES (${buildLanguagesPath})`,
  );
  process.exit(1);
}

const camelName = toCamelCase(name);
const pascalName = camelName.slice(0, 1).toUpperCase() + camelName.slice(1);

/** Replaces the first (and only expected) occurrence of `anchor` in `path`. */
async function replaceOnce(
  path: string,
  anchor: string | RegExp,
  replacement: string,
) {
  const content = await Bun.file(path).text();
  const occurrences = content.split(anchor).length - 1;

  if (occurrences !== 1) {
    throw new Error(
      `expected exactly one occurrence of anchor in ${path}, found ${occurrences}: ${JSON.stringify(anchor)}`,
    );
  }

  await Bun.write(path, content.replace(anchor, replacement));
}

/**
 * Inserts `importLine` into an alphabetically-sorted block of import lines
 * matched by `pattern` (must have the importable slug as its last capture
 * group), keeping the block sorted.
 */
async function insertImportAlphabetically(
  path: string,
  pattern: RegExp,
  importLine: string,
) {
  const content = await Bun.file(path).text();
  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) {
    throw new Error(`no import lines matched ${pattern} in ${path}`);
  }

  const target = matches.find((match) => {
    const slug = match.at(-1) ?? "";
    return slug > name;
  });

  if (target) {
    await Bun.write(
      path,
      content.replace(target[0], `${importLine}\n${target[0]}`),
    );
    return;
  }

  const last = matches.at(-1);
  if (!last) return;
  await Bun.write(path, content.replace(last[0], `${last[0]}\n${importLine}`));
}

// 1. scripts/custom-languages/<name>.js
await Bun.write(
  grammarPath,
  `// TODO: model this grammar on an existing one -- e.g. zig.js for a
// keyword-heavy language, or csv.js for a keyword-less, contains-only one.

/** @param {import("highlight.js").HLJSApi} hljs */
function define${pascalName}(hljs) {
  return {
    name: "${name}",
    contains: [hljs.HASH_COMMENT_MODE],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return define${pascalName}(hljs);
}

export const ${camelName} = { name: "${name}", register };
export default ${camelName};
`,
);

// 2. CUSTOM_LANGUAGE_NAMES in scripts/build-languages.ts
await replaceOnce(
  buildLanguagesPath,
  "] as const;",
  `  "${name}",\n] as const;`,
);

// 3. CUSTOM_SNIPPETS in tests/differential-corpus.ts
await replaceOnce(
  "tests/differential-corpus.ts",
  /\};\s*$/,
  `  "${name}": \`// TODO: a short, multi-construct ${displayName} sample\`,\n};\n`,
);

// 4. tests/languages.test.ts's expected language count
{
  const path = "tests/languages.test.ts";
  const content = await Bun.file(path).text();
  const match = content.match(
    /expect\(languageNames\.length\)\.toEqual\((\d+)\);/,
  );

  const currentCount = match?.[1];
  if (!match || currentCount === undefined) {
    throw new Error(`could not find the language count assertion in ${path}`);
  }

  const next = Number(currentCount) + 1;
  const replacement = `expect(languageNames.length).toEqual(${next});`;
  await Bun.write(path, content.replace(match[0], replacement));
}

// 5. tests/<name>-language.test.ts
await Bun.write(
  `tests/${name}-language.test.ts`,
  `import { createRegistry } from "../src/engine.js";

import ${camelName} from "../src/languages/${name}";

const registry = createRegistry();

registry.register(${camelName}.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "${name}" }).value;

// TODO: replace with real assertions once the grammar is implemented.
test("${name} highlights something", () => {
  const result = highlight("// TODO");

  expect(result).toBeTruthy();
});
`,
);

// 6. www/preview/<name>-preview-snippets.ts
await Bun.write(
  `www/preview/${name}-preview-snippets.ts`,
  `export type ${pascalName}PreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

// TODO: add at least 3 real-world snippets.
export const ${camelName}PreviewSnippets: ${pascalName}PreviewSnippet[] = [];
`,
);

// 7. www/pages/preview-<name>.astro
await Bun.write(
  `www/pages/preview-${name}.astro`,
  `---
import LanguagePreview from "@components/LanguagePreview.svelte";
import Layout from "@layouts/Layout.astro";
---

<Layout title="${displayName} language preview">
  <LanguagePreview language="${name}" client:idle />
</Layout>
`,
);

// 8. www/components/LanguagePreview.svelte: imports + registry entry
const languagePreviewPath = "www/components/LanguagePreview.svelte";

await insertImportAlphabetically(
  languagePreviewPath,
  /^ {2}import \{ (\w+)PreviewSnippets \} from "@www\/preview\/([a-z0-9-]+)-preview-snippets";$/gm,
  `  import { ${camelName}PreviewSnippets } from "@www/preview/${name}-preview-snippets";`,
);

await insertImportAlphabetically(
  languagePreviewPath,
  /^ {2}import (\w+) from "svelte-highlight\/languages\/([a-z0-9-]+)";$/gm,
  `  import ${camelName} from "svelte-highlight/languages/${name}";`,
);

await replaceOnce(
  languagePreviewPath,
  "  };\n\n  $: ({ lang, snippets } = registry[language]);",
  `    "${name}": { lang: ${camelName}, snippets: ${camelName}PreviewSnippets },\n  };\n\n  $: ({ lang, snippets } = registry[language]);`,
);

// 9. www/components/globals/Header.svelte: hiddenRoutes entry
await replaceOnce(
  "www/components/globals/Header.svelte",
  "  };\n\n  $: path = pathname",
  `    "/preview-${name}": "${displayName} language preview",\n  };\n\n  $: path = pathname`,
);

console.log(`Scaffolded "${name}" (${displayName}):
  scripts/custom-languages/${name}.js               (new)
  scripts/build-languages.ts                          (CUSTOM_LANGUAGE_NAMES)
  tests/differential-corpus.ts                        (CUSTOM_SNIPPETS)
  tests/languages.test.ts                             (language count)
  tests/${name}-language.test.ts                     (new)
  www/preview/${name}-preview-snippets.ts            (new)
  www/pages/preview-${name}.astro                    (new)
  www/components/LanguagePreview.svelte               (imports + registry)
  www/components/globals/Header.svelte                (hiddenRoutes)

Next steps:
  1. Fill in the grammar body in scripts/custom-languages/${name}.js.
  2. Replace the TODO differential-corpus snippet with a real sample.
  3. Write real assertions in tests/${name}-language.test.ts.
  4. Add >= 3 real-world snippets to www/preview/${name}-preview-snippets.ts.
  5. Run:
     bun run build:lib && bun test tests/languages.test.ts tests/languages-golden.test.ts tests/${name}-language.test.ts --update-snapshots && bun run test:types
`);
