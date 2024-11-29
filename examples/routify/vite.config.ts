import routify from "@roxi/routify/vite-plugin";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    routify({
      render: {
        ssr: { enable: false },
      },
    }),
    svelte({
      preprocess: [vitePreprocess()],
    }),
  ],
});
