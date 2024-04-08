import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";

export default {
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
    }),
  ],
} satisfies UserConfig;
