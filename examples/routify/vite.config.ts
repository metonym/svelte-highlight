import routify from "@roxi/routify/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    routify({
      render: {
        ssr: { enable: false },
      },
    }),
    svelte(),
  ],
});
