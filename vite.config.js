import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    process.env.VITEST
      ? svelte({
          hot: false,
        })
      : sveltekit(),
  ],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
};

export default config;
