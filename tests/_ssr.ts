// @depends-on src/*.svelte src/*.js
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";

const SRC = path.join(import.meta.dir, "../src");
const SVELTE_IMPORT = /from "\.\/([\w-]+)\.svelte"/g;

const tmpName = (name: string) => `.tmp-ssr-${name}.server.js`;

/**
 * Compiles `src/<name>.svelte` and every component it imports, transitively,
 * for the server, next to the sources so their relative `.js` imports
 * resolve, and imports it. Bun's `.svelte` loader compiles for the client,
 * which `svelte/server`'s `render` can't run.
 */
export async function loadForServer(name: string) {
  const written: string[] = [];
  const pending = [name];
  const seen = new Set<string>();
  while (pending.length > 0) {
    const next = pending.pop() as string;
    if (seen.has(next)) continue;
    seen.add(next);
    const source = fs.readFileSync(path.join(SRC, `${next}.svelte`), "utf-8");
    const { js } = compile(source, {
      generate: "server",
      filename: `${next}.svelte`,
    });
    const code = js.code.replace(SVELTE_IMPORT, (_, dep: string) => {
      pending.push(dep);
      return `from "./${tmpName(dep)}"`;
    });
    const out = path.join(SRC, tmpName(next));
    fs.writeFileSync(out, code);
    written.push(out);
  }
  try {
    return await import(pathToFileURL(path.join(SRC, tmpName(name))).href);
  } finally {
    for (const file of written) fs.unlinkSync(file);
  }
}
