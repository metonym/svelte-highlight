import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";

export default {
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
    }),
  ],
} satisfies UserConfig;
