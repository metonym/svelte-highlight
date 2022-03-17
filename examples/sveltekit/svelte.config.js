import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
    vite: {
      optimizeDeps: {
        include: ["highlight.js", "highlight.js/lib/core"],
      },
    },
  },
};
