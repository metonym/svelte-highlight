import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
    target: "#svelte",
    vite: {
      optimizeDeps: {
        include: ["highlight.js/lib/core"],
      },
    },
  },
};
