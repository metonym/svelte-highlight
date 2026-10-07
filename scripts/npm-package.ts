import { $ } from "bun";

console.time("package");
await $`rm -rf package; mkdir package`;
await $`cp README.md LICENSE LICENSE.highlight.txt package; cp -r src/ package`;

const pkgJson = await Bun.file("./package.json").json();
pkgJson.scripts = undefined;
pkgJson.devDependencies = undefined;

/** Exports `./<name>` (and `./<name>.js` when `withJs`) from `<file>.js`. */
const entry = (
  name: string,
  file: string,
  condition: "import" | "default",
  withJs = true,
) => {
  const target = { types: `./${file}.d.ts`, [condition]: `./${file}.js` };
  return [
    [`./${name}`, target],
    ...(withJs ? [[`./${name}.js`, target]] : []),
  ] as const;
};

pkgJson.exports = Object.fromEntries([
  [".", { types: "./index.d.ts", svelte: "./index.js" }],
  ...entry("static", "static", "import"),
  ...entry("fence", "fence", "import"),
  ["./*.svelte", { types: "./*.svelte.d.ts", import: "./*.svelte" }],
  ["./styles/*.css", { import: "./styles/*.css" }],
  ...entry("styles", "styles/index", "import", false),
  ...entry("styles/*", "styles/*", "import"),
  ...entry("themes", "themes/index", "import", false),
  ...entry("themes/*", "themes/*", "import"),
  ["./themes/*.css", { import: "./themes/*.css" }],
  ...entry("theme", "theme", "default", false),
  ...entry("theme/textmate", "textmate-theme", "default", false),
  ...entry("languages", "languages/index", "import", false),
  ...entry("languages/*", "languages/*", "import"),
  ...entry("engine", "engine", "default"),
  ...entry("tokenized-document", "tokenized-document", "default"),
  ...entry("typewriter-units", "typewriter-units", "default"),
  ...entry("registry", "registry", "default"),
  ...entry("ansi", "ansi", "default", false),
  ...entry("copy-transforms", "copy-transforms", "default", false),
  ...entry("load-language", "load-language", "default", false),
  ...entry("scoped", "scoped", "default", false),
  ...entry("compat", "compat", "default"),
  ...entry("transformers", "transformers", "default"),
  ...entry("worker", "worker", "import"),
  ...entry("search", "search", "import"),
  ["./search.css", { import: "./search.css" }],
  ["./package.json", "./package.json"],
]);

// `svelte` is the deprecated pre-exports entry point, kept for old tooling.
pkgJson.svelte = "./index.js";
pkgJson.types = "./index.d.ts";

// Paths are relative to the published root (src/ is copied flat).
pkgJson.sideEffects = [
  "styles/*.css",
  "themes/*.css",
  "langtag.css",
  "search.css",
];

await Bun.write("./package/package.json", JSON.stringify(pkgJson, null, 2));
console.timeEnd("package");
