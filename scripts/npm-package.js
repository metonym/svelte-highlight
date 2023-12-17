// @ts-check
import fs from "node:fs";
import { copyFile, mkdir, writeFile } from "./utils/fs.js";

async function npmPackage() {
  console.time("package");

  mkdir("./package");

  await copyFile("./package.json", "./package/package.json");
  await copyFile("./README.md", "./package/README.md");
  await copyFile("./LICENSE", "./package/LICENSE");

  // Copy source folder to package
  mkdir("./package/src");
  fs.cpSync("./src", "./package", { recursive: true });
  fs.rmSync("./package/src", { recursive: true, force: true });

  const pkgJson = JSON.parse(
    fs.readFileSync("./package/package.json", "utf-8"),
  );

  delete pkgJson.scripts;
  delete pkgJson.devDependencies;

  pkgJson.exports = {
    ".": {
      types: "./index.d.ts",
      svelte: "./index.js",
    },
    "./*": {
      types: "./*.d.ts",
      svelte: "./*.svelte",
    },
    "./styles/*.css": {
      import: "./styles/*.css",
    },
    "./styles/*": {
      types: "./styles/*.d.ts",
      import: "./styles/*.js",
    },
    "./languages/*": {
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

  await writeFile("./package/package.json", JSON.stringify(pkgJson, null, 2));
  console.timeEnd("package");
}

npmPackage();
