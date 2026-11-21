import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BUILT_ASSET_RE = /\.(js|html|css)$/;

// Every grammar object has the shape `{ name, register: { name, ... } }`.
// The minifier strips the license banner but keeps this, with any quote.
const GRAMMAR_RE = /register:\{name:["'`]([^"'`]+)["'`]/g;

// HighlightAutoLazy's entry JS (component, engine, fingerprint index,
// Svelte runtime) must stay far below HighlightAuto's, which carries every
// grammar. The fingerprint index alone is about 33 KB gzip.
const LAZY_ENTRY_GZIP_BUDGET_BYTES = 80 * 1024;

/**
 * The JS files `index.html` loads up front, plus their static imports.
 * Excludes chunks that only load through a dynamic `import()`.
 */
function readEntryScripts(distDir: string): string[] {
  const html = readFileSync(join(distDir, "index.html"), "utf8");
  const seen = new Set<string>();
  const queue = [...html.matchAll(/src="\/([^"]+\.js)"/g)].map(
    (match) => match[1] as string,
  );
  while (queue.length > 0) {
    const file = queue.shift() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(join(distDir, file), "utf8");
    // Vite emits static imports between chunks as `from"./x.js"` or
    // `import"./x.js"`.
    for (const match of text.matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)) {
      queue.push(join(file, "..", match[1] as string));
    }
  }
  return [...seen].map((file) => readFileSync(join(distDir, file), "utf8"));
}

function grammarsIn(text: string): Set<string> {
  return new Set([...text.matchAll(GRAMMAR_RE)].map((m) => m[1] as string));
}

function measureEntry(entry: string, distDir: string) {
  const scripts = readEntryScripts(distDir);
  const text = scripts.join("");
  const raw = Buffer.byteLength(text);
  const gzip = scripts.reduce((total, s) => total + gzipSync(s).length, 0);
  const grammars = grammarsIn(text);
  console.log(
    `  (measured) ${entry} entry JS: ${(raw / 1024).toFixed(1)} KB raw, ${(gzip / 1024).toFixed(1)} KB gzip, ${grammars.size} grammars`,
  );
  return { gzip, grammars };
}

// A private, minification-resistant internal string from highlight.js/lib/core - present only if
// highlight.js core actually ships in the bundle.
const HLJS_CORE_MARKER = "highlight.js/private";
// highlight.js's own registerLanguage error string - a second, independent absence check.
const HLJS_REGISTER_MARKER = "Language definition for";

function readAllText(dir: string): string {
  let text = "";

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      text += readAllText(path);
    } else if (BUILT_ASSET_RE.test(entry.name)) {
      text += readFileSync(path, "utf8");
    }
  }

  return text;
}

function noRuntimeHljs(output: string): Array<{ name: string; pass: boolean }> {
  return [
    {
      name: "highlight.js core is not bundled (a private, minification-resistant internal string is absent)",
      pass: !output.includes(HLJS_CORE_MARKER),
    },
    {
      name: "highlight.js's registerLanguage error string is not bundled",
      pass: !output.includes(HLJS_REGISTER_MARKER),
    },
  ];
}

const CHECKS: Record<
  string,
  (output: string, distDir: string) => Array<{ name: string; pass: boolean }>
> = {
  "single-snippet-injected-style": (output) => [
    {
      name: "the static hljs markup for the <Highlight> usage is present",
      pass:
        output.includes('data-language="javascript"') &&
        output.includes("hljs-keyword"),
    },
    {
      name: "the atom-one-dark theme (loaded via svelte:head) is present",
      pass: output.includes("#282c34") && output.includes("#abb2bf"),
    },
    ...noRuntimeHljs(output),
  ],
  "single-snippet-stylesheet": (output) => [
    {
      name: "the static hljs markup for the <Highlight> usage is present",
      pass:
        output.includes('data-language="javascript"') &&
        output.includes("hljs-keyword"),
    },
    {
      name: "the atom-one-dark theme (loaded via a CSS stylesheet import) is present",
      pass: output.includes("#282c34") && output.includes("#abb2bf"),
    },
    ...noRuntimeHljs(output),
  ],
  "multiple-snippets-same-language": (output) => [
    {
      name: "all three same-language <Highlight> usages are statically rendered",
      pass:
        (output.match(/data-language="javascript"/g) ?? []).length >= 3 &&
        output.includes('a = <span class="hljs-number">1') &&
        output.includes('b = <span class="hljs-number">2') &&
        output.includes('c = <span class="hljs-number">3'),
    },
    ...noRuntimeHljs(output),
  ],
  "multiple-snippets-various-languages": (output) => [
    {
      name: "the javascript, typescript, and css <Highlight> usages are all statically rendered",
      pass:
        output.includes('data-language="javascript"') &&
        output.includes('data-language="typescript"') &&
        output.includes('data-language="css"'),
    },
    ...noRuntimeHljs(output),
  ],
  "scoped-styles-multiple-themes": (output) => [
    {
      name: "both <Highlight> usages (one per HighlightStyle scope) are statically rendered",
      pass: (output.match(/data-language="javascript"/g) ?? []).length >= 2,
    },
    {
      name: "both themes (a11y-dark and github) are present, each under its own scope class",
      // a11y-dark's base background; github's base color.
      pass: output.includes("#2b2b2b") && output.includes("#24292e"),
    },
    ...noRuntimeHljs(output),
  ],
  // The baseline for highlight-auto-lazy: HighlightAuto imports every
  // grammar up front.
  "highlight-auto": (output, distDir) => {
    const { grammars } = measureEntry("highlight-auto", distDir);
    return [
      {
        name: "the entry JS carries every grammar (css included)",
        pass: grammars.has("css") && grammars.size > 200,
      },
      ...noRuntimeHljs(output),
    ];
  },
  "highlight-auto-lazy": (output, distDir) => {
    const { gzip, grammars } = measureEntry("highlight-auto-lazy", distDir);
    return [
      {
        name: "the entry JS carries no grammar",
        pass: grammars.size === 0,
      },
      {
        name: `the entry JS is under ${LAZY_ENTRY_GZIP_BUDGET_BYTES / 1024} KB gzip`,
        pass: gzip < LAZY_ENTRY_GZIP_BUDGET_BYTES,
      },
      {
        name: "every grammar is still emitted as its own lazy chunk",
        pass: grammarsIn(output).size > 200,
      },
      ...noRuntimeHljs(output),
    ];
  },
};

const entry = process.argv[2] ?? process.env.ENTRY;

if (!entry || !CHECKS[entry]) {
  console.error(
    `Usage: node verify.ts <entry>\nKnown entries: ${Object.keys(CHECKS).join(", ")}`,
  );
  process.exit(1);
}

const distDir = new URL(`./dist/${entry}/`, import.meta.url).pathname;
const output = readAllText(distDir);
const checks = CHECKS[entry](output, distDir);

let failed = false;

console.log(`\n${entry}:`);
for (const check of checks) {
  console.log(`  ${check.pass ? "PASS" : "FAIL"} - ${check.name}`);
  if (!check.pass) failed = true;
}

if (failed) {
  console.error(`\n${entry}: verification failed.`);
  process.exit(1);
}

console.log(`\n${entry}: verification passed.`);
