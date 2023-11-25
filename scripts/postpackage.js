// @ts-check
import fs from "node:fs";

const PKG_JSON_PATH = "./package/package.json";

console.time("postbuild");

const pkg_package = JSON.parse(fs.readFileSync(PKG_JSON_PATH, "utf8"));

// Delete `devDependencies` from `package.json`
delete pkg_package.devDependencies;

fs.writeFileSync(PKG_JSON_PATH, JSON.stringify(pkg_package, null, 2));

// Delete .gitignore file
fs.unlinkSync("./package/.gitignore");

console.timeEnd("postbuild");