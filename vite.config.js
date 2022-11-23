import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const TEST = process.env.VITEST;

/** @type {import('vite').UserConfig} */
export default {
  plugins: [TEST ? svelte({ hot: false }) : sveltekit()],
  optimizeDeps: {
    exclude: ["carbon-components-svelte", "carbon-icons-svelte"],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  test: {
    environment: "jsdom",
  },
};
