import { readFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const appDir = join(import.meta.dirname, "..");
const manifest = JSON.parse(
  readFileSync(join(appDir, "entries.manifest.json"), "utf8"),
);

let failed = false;

for (const entry of manifest) {
  console.log(`\nBuilding entry: ${entry}`);
  try {
    // biome-ignore lint/performance/noAwaitInLoops: sequential builds avoid dist races and keep logs readable
    await $`cd ${appDir} && ENTRY=${entry} bunx vite build`;
    await $`cd ${appDir} && node verify.ts ${entry}`;
  } catch {
    failed = true;
  }
}

if (failed) {
  console.error("\nOne or more static-app entries failed.");
  process.exit(1);
}

console.log("\nAll static-app entries passed.");
