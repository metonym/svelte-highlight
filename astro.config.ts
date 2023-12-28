import svelte from "@astrojs/svelte";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "astro/config";
import { optimizeImports } from "carbon-preprocess-svelte";

export default defineConfig({
  outDir: "build",
  trailingSlash: "never",
  integrations: [
    svelte({
      preprocess: [vitePreprocess(), optimizeImports()],
    }),
  ],
  srcDir: "./www",
  publicDir: "./www/public",
  vite: {
    define: {
      "process.env.TS": JSON.stringify(new Date().toLocaleString()),
    },
    optimizeDeps: {
      // We use the `optimizeImports` preprocessor so we
      // don't need Vite to do redundant work here.
      exclude: ["carbon-components-svelte"],
    },
  },
});
