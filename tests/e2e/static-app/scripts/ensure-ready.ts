import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const repoRoot = new URL("../../../../", import.meta.url);
const appDir = new URL("../", import.meta.url);

function run(cmd: string, args: string[], cwd: URL) {
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

if (!existsSync(new URL("package/package.json", repoRoot))) {
  console.log(
    "[static-app] svelte-highlight package/ not found - building it first (bun run build:lib && bun run package)...",
  );
  run("bun", ["run", "build:lib"], repoRoot);
  run("bun", ["run", "package"], repoRoot);
}

if (
  !existsSync(new URL("node_modules/svelte-highlight/package.json", appDir))
) {
  console.log("[static-app] installing dependencies...");
  run("bun", ["install"], appDir);
}
