/**
 * Runs `ostia ab` with the base tree's generated files in place.
 *
 * `ostia ab` benches the working tree against a `git archive` of the base
 * ref. That archive has no `src/languages`, `src/styles`, or `src/themes`,
 * since they're gitignored build output. Without them, base-side suites
 * either crash or silently bench a failed import.
 *
 * So this script prepares the base tree before ostia sees it: it extracts
 * the ref into ostia's cache directory, runs that ref's own build there, and
 * applies the same trailer ostia appends to base-side code files. ostia then
 * finds the directory and reuses it as-is. This mirrors ostia 0.2.9's cache
 * layout (`<out-dir>/ab/<sha>`); if that layout changes, ostia extracts its
 * own copy and we're back to the missing-files failure above.
 *
 * Usage: bun bench:ab [ostia ab flags] <suite.ts...>
 */

import { appendFileSync, existsSync, renameSync } from "node:fs";
import path from "node:path";
import { $ } from "bun";

const args = process.argv.slice(2);

function flagValue(flag: string) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i] as string;
    if (arg === flag) return args[i + 1];
    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);
  }
  return undefined;
}

const root = (await $`git rev-parse --show-toplevel`.text()).trim();
const base = flagValue("--base") ?? "HEAD";
const sha = (
  await $`git rev-parse --verify ${`${base}^{commit}`}`.text()
).trim();
const outDir = path.resolve(
  root,
  flagValue("--out-dir") ?? "node_modules/.cache/ostia",
);
const baseDir = path.join(outDir, "ab", sha);

// Matches ostia's base-tree trailer, which keeps base and candidate modules
// from sharing transpiler/JIT caches when their source is otherwise equal.
const BASE_TRAILER = "\n;globalThis.__ostia_ab_base__;\n";
const CODE_FILES = new Bun.Glob("**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}");

// A tree ostia extracted on its own lacks the generated files; redo it.
if (existsSync(baseDir) && !existsSync(path.join(baseDir, "src/languages"))) {
  await $`rm -rf ${baseDir}`;
}

if (!existsSync(baseDir)) {
  const tmp = `${baseDir}.tmp-${process.pid}`;
  await $`rm -rf ${tmp} && mkdir -p ${tmp}`;
  await $`git archive --format=tar ${sha} | tar -x -C ${tmp}`.cwd(root);

  console.error(`bench:ab: building generated files for ${sha.slice(0, 7)}`);
  // The build reads `./node_modules` (hljs sources, licenses), so borrow
  // ours for the build, then drop the link before the trailer pass below.
  await $`ln -s ${path.join(root, "node_modules")} node_modules`.cwd(tmp);
  await $`bun scripts/index.ts`.cwd(tmp).quiet();
  await $`rm node_modules`.cwd(tmp);

  for await (const file of CODE_FILES.scan({ cwd: tmp, absolute: true })) {
    if (/\.d\.[mc]?ts$/.test(file)) continue;
    appendFileSync(file, BASE_TRAILER);
  }
  renameSync(tmp, baseDir);
}

const ostia = Bun.spawn(["bunx", "ostia", "ab", ...args], {
  cwd: root,
  stdio: ["inherit", "inherit", "inherit"],
});
process.exit(await ostia.exited);
