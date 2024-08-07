import { $ } from "bun";

console.time("package");
await $`rm -rf package; mkdir package`;
await Bun.write("./package/package.json", Bun.file("./package.json"));
await Bun.write("./package/README.md", Bun.file("./README.md"));
await Bun.write("./package/LICENSE", Bun.file("./LICENSE"));

// Copy source folder to package
await $`cp -r ./src/ ./package`;

const pkgJson = await Bun.file("./package/package.json").json();

delete pkgJson.scripts;
delete pkgJson.devDependencies;
delete pkgJson.prettier;

pkgJson.exports = {
  ".": {
    types: "./index.d.ts",
    svelte: "./index.js",
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
  "./package.json": "./package.json",
};

// Svelte entry point is deprecated but we preserve it for backwards compatibility.
pkgJson.svelte = "./index.js";
pkgJson.types = "./index.d.ts";

// Most modern bundlers know if standalone StyleSheets are used.
// We specify it here to be sure so that it will not be mistakenly tree-shaken.
pkgJson.sideEffects = ["src/styles/*.css"];

await Bun.write("./package/package.json", JSON.stringify(pkgJson, null, 2));
console.timeEnd("package");
