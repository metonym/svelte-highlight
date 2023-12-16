// @ts-check
import fs from "node:fs";
import { totalist } from "totalist";
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
      svelte: "./index.js",
    },
  };

  const deny_list = new Set(["LICENSE", "README.md"]);

  /**  {@link pkgJson.exports} already accounts for the Svelte entry point.  */
  const skip_list = new Set(["index.js"]);

  await totalist("./package", (rel, abs, stats) => {
    if (stats.isFile() && !rel.endsWith(".d.ts") && !deny_list.has(rel)) {
      if (skip_list.has(rel)) return;

      if (/\//g.test(rel)) {
        // Skip files inside of folders. A subpath is more readable.
        return;
      }

      const rel_prefix = "./" + rel;

      // Remove file extension for JS files as it is the default.
      const exports_key = rel_prefix.replace(/\.js$/, "");

      pkgJson.exports[exports_key] = rel_prefix;
    }
  });

  pkgJson.exports["./styles/*"] = "./styles/*";
  pkgJson.exports["./languages/*"] = "./languages/*";

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
