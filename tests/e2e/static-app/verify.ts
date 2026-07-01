import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BUILT_ASSET_RE = /\.(js|html|css)$/;

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
  (output: string) => Array<{ name: string; pass: boolean }>
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
const checks = CHECKS[entry](output);

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
