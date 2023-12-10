import { sveltekit } from "@sveltejs/kit/vite";
import path from "path";


/** @type {import('vite').UserConfig} */
export default {
  plugins: [sveltekit()],
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
