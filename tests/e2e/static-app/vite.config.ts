import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { highlightStatic } from "svelte-highlight/static.js";

const dir = fileURLToPath(new URL(".", import.meta.url));
const entry = process.env.ENTRY ?? "single-snippet-injected-style";

export default {
  root: resolve(dir, "entries", entry),
  build: {
    outDir: resolve(dir, "dist", entry),
    emptyOutDir: true,
  },
  plugins: [svelte({ preprocess: [highlightStatic()] })],
};
