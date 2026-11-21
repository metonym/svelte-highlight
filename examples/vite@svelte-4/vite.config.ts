import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defaultClientConditions, type UserConfig } from "vite";

export default {
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
    }),
  ],
  // vite-plugin-svelte 3 sets its own conditions, which replace Vite 6's
  // defaults. Without "browser", Svelte 4 resolves to its SSR runtime.
  resolve: {
    conditions: [...defaultClientConditions],
  },
} satisfies UserConfig;
