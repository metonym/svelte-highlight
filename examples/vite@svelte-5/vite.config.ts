import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import type { UserConfig } from "vite";

export default {
  resolve: {
    conditions: ["browser"],
  },
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
    }),
  ],
} satisfies UserConfig;
