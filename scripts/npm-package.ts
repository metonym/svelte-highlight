import { $ } from "bun";

console.time("package");
await $`rm -rf package; mkdir package`;
await Bun.write("./package/package.json", Bun.file("./package.json"));
await Bun.write("./package/README.md", Bun.file("./README.md"));
await Bun.write("./package/LICENSE", Bun.file("./LICENSE"));
await Bun.write(
  "./package/LICENSE.highlight.txt",
  Bun.file("./LICENSE.highlight.txt"),
);

// Copy source folder to package
await $`cp -r ./src/ ./package`;

const pkgJson = await Bun.file("./package/package.json").json();

pkgJson.scripts = undefined;
pkgJson.devDependencies = undefined;

pkgJson.exports = {
  ".": {
    types: "./index.d.ts",
    svelte: "./index.js",
  },
  "./static": {
    types: "./static.d.ts",
    import: "./static.js",
  },
  "./static.js": {
    types: "./static.d.ts",
    import: "./static.js",
  },
  "./*.svelte": {
    types: "./*.svelte.d.ts",
    import: "./*.svelte",
  },
  "./styles/*.css": {
    import: "./styles/*.css",
  },
  "./styles": {
    types: "./styles/index.d.ts",
    import: "./styles/index.js",
  },
  "./styles/*": {
    types: "./styles/*.d.ts",
    import: "./styles/*.js",
  },
  "./styles/*.js": {
    types: "./styles/*.d.ts",
    import: "./styles/*.js",
  },
  "./themes": {
    types: "./themes/index.d.ts",
    import: "./themes/index.js",
  },
  "./themes/*": {
    types: "./themes/*.d.ts",
    import: "./themes/*.js",
  },
  "./themes/*.js": {
    types: "./themes/*.d.ts",
    import: "./themes/*.js",
  },
  "./themes/*.css": {
    import: "./themes/*.css",
  },
  "./theme": {
    types: "./theme.d.ts",
  },
  "./languages": {
    types: "./languages/index.d.ts",
    import: "./languages/index.js",
  },
  "./languages/*": {
    types: "./languages/*.d.ts",
    import: "./languages/*.js",
  },
  "./languages/*.js": {
    types: "./languages/*.d.ts",
    import: "./languages/*.js",
  },
  "./engine": {
    types: "./engine.d.ts",
    default: "./engine.js",
  },
  "./engine.js": {
    types: "./engine.d.ts",
    default: "./engine.js",
  },
  "./tokenized-document": {
    types: "./tokenized-document.d.ts",
    default: "./tokenized-document.js",
  },
  "./tokenized-document.js": {
    types: "./tokenized-document.d.ts",
    default: "./tokenized-document.js",
  },
  "./registry": {
    types: "./registry.d.ts",
    default: "./registry.js",
  },
  "./registry.js": {
    types: "./registry.d.ts",
    default: "./registry.js",
  },
  "./ansi": {
    types: "./ansi.d.ts",
    default: "./ansi.js",
  },
  "./copy-transforms": {
    types: "./copy-transforms.d.ts",
    default: "./copy-transforms.js",
  },
  "./load-language": {
    types: "./load-language.d.ts",
    default: "./load-language.js",
  },
  "./scoped": {
    types: "./scoped.d.ts",
    default: "./scoped.js",
  },
  "./compat": {
    types: "./compat.d.ts",
    default: "./compat.js",
  },
  "./compat.js": {
    types: "./compat.d.ts",
    default: "./compat.js",
  },
  "./package.json": "./package.json",
};

// Svelte entry point is deprecated but we preserve it for backwards compatibility.
pkgJson.svelte = "./index.js";
pkgJson.types = "./index.d.ts";

// Most modern bundlers know if standalone StyleSheets are used.
// We specify it here to be sure so that it will not be mistakenly tree-shaken.
// `cp -r ./src/ ./package` flattens src/ into the package root, so these
// globs must match the published layout, not the source layout.
pkgJson.sideEffects = ["styles/*.css", "themes/*.css", "langtag.css"];

await Bun.write("./package/package.json", JSON.stringify(pkgJson, null, 2));
console.timeEnd("package");
