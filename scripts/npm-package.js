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

  const pkgJson = JSON.parse(
    fs.readFileSync("./package/package.json", "utf-8"),
  );

  delete pkgJson.scripts;
  delete pkgJson.devDependencies;

  pkgJson.svelte = "./index.js";
  pkgJson.types = "./index.d.ts";
  pkgJson.sideEffects = ["src/styles/*.css"];

  pkgJson.exports = {};

  const deny_list = new Set(["LICENSE", "README.md"]);

  await totalist("./package", (rel, abs, stats) => {
    if (stats.isFile() && !rel.endsWith(".d.ts") && !deny_list.has(rel)) {
      const rel_prefix = "./" + rel;
      pkgJson.exports[rel_prefix.replace(/\.js$/, "")] = rel_prefix;
    }
  });

  await writeFile("./package/package.json", JSON.stringify(pkgJson, null, 2));
  console.timeEnd("package");
}

npmPackage();
