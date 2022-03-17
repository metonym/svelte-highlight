import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  plugins: [svelte()],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
}));
