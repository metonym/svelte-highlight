import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    svelte({
      preprocess: preprocess(),
    }),
  ],
};
