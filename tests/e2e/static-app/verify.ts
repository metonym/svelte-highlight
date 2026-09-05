import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BUILT_ASSET_RE = /\.(js|html|css)$/;
// Every hljs-derived grammar module carries this banner (see
// scripts/convert-grammars.ts's licenseBanner) - a second, independent
// absence check alongside the raw size budget below.
const GRAMMAR_BANNER_MARKER = "derived from highlight.js";
// HighlightAuto's default-path *entry-chunk* budget: component +
// auto-detect.js + the detect-index fingerprint table (<= 40 KB per its own
// build budget) + engine.js + the Svelte runtime, well under any single
// grammar chunk (many are 10-50+ KB; the largest in this corpus is ~525 KB).
//
// Deliberately scoped to the entry chunk(s) `index.html` actually
// references, not every file under dist/: `HighlightAuto`'s default path
// calls `loadLanguage()` (via auto-detect.js), whose `import(`./languages/
// ${name}.js`)` has a non-literal specifier, so bundlers can't know which
// of the ~245 language files it might resolve to at runtime and
// conservatively emit a lazy chunk for *every* one of them, plus a
// name->loader map in the entry chunk. Those 245 chunks are real files
// under dist/, but the browser only ever fetches the 1-2 tier-1 actually
// picks - measuring the whole directory would flunk this budget for a
// reason that has nothing to do with what a page visitor downloads.
const HIGHLIGHT_AUTO_JS_BUDGET_BYTES = 200 * 1024;

/** Files `index.html`'s own <script>/<link> tags reference, resolved to disk paths. */
function readEntryAssetPaths(distDir: string): string[] {
  const html = readFileSync(join(distDir, "index.html"), "utf8");
  const paths: string[] = [];
  for (const match of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css))"/g)) {
    paths.push(join(distDir, match[1] as string));
  }
  return paths;
}

function entryAssetBytes(distDir: string): number {
  return readEntryAssetPaths(distDir).reduce(
    (total, path) => total + statSync(path).size,
    0,
  );
}

function readEntryAssetText(distDir: string): string {
  return readEntryAssetPaths(distDir)
    .map((path) => readFileSync(path, "utf8"))
    .join("");
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
  // "languages/all" itself is *not* checked here: `loadLanguage()`'s
  // `import(`./languages/${name}.js`)` has a non-literal specifier
  // (unchanged, pre-existing, out of this task's scope - see
  // load-language.js), so Vite can't know which files `name` might resolve
  // to and conservatively emits a lazy name->chunk map in the entry chunk
  // covering *every* file under languages/, "all.js" included - that map
  // entry is unavoidable and harmless (it's a loader reference, not
  // grammar content; confirmed by the banner check below). The no-static-
  // import claim itself is asserted directly against the source in
  // tests/highlight-auto-no-static-language-import.test.ts, which doesn't
  // have this false-positive problem.
  "highlight-auto-no-grammars": (_output, distDir) => {
    const entryOutput = readEntryAssetText(distDir);
    const entryBytes = entryAssetBytes(distDir);
    console.log(
      `  (measured) highlight-auto-no-grammars entry-chunk JS+CSS: ${(entryBytes / 1024).toFixed(1)} KB`,
    );
    return [
      {
        name: "no hljs-derived grammar module is bundled into the entry chunk (license banner absent)",
        pass: !entryOutput.includes(GRAMMAR_BANNER_MARKER),
      },
      {
        name: `entry-chunk JS+CSS is under the ${(HIGHLIGHT_AUTO_JS_BUDGET_BYTES / 1024).toFixed(0)} KB budget (what a page visitor actually downloads before any grammar loads)`,
        pass: entryBytes < HIGHLIGHT_AUTO_JS_BUDGET_BYTES,
      },
      ...noRuntimeHljs(entryOutput),
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
