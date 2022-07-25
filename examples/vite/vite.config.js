import { svelte } from "@sveltejs/vite-plugin-svelte";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [svelte()],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
};
