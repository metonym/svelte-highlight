import { sveltekit } from "@sveltejs/kit/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const TEST = process.env.VITEST;

/** @type {import('vite').UserConfig} */
export default {
  plugins: [TEST ? svelte({ hot: false }) : sveltekit()],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  test: {
    environment: "jsdom",
    deps: {
      /**
       * Opt out of experimental Node loader to resolve imports
       * @see https://github.com/vitest-dev/vitest/issues/1753#issuecomment-1200436847
       */
      registerNodeLoader: false,
    },
  },
};
