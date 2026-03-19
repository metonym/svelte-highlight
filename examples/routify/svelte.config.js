import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import("svelte/compiler").CompileOptions} */
export default {
  preprocess: vitePreprocess(),
};
