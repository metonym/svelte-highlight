import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
    }),
  ],
};
