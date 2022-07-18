import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
};
