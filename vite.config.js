import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

const TEST = process.env.VITEST;

/** @type {import('vite').UserConfig} */
export default {
  plugins: [TEST ? svelte({ hot: false }) : sveltekit()],
  optimizeDeps: {
    exclude: ["carbon-components-svelte", "carbon-icons-svelte"],
  },
  resolve: {
    alias: {
      lib: path.resolve("demo/lib"),
      "svelte-highlight": path.resolve("src"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
};
