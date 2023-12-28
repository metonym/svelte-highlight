import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import { optimizeImports } from "carbon-preprocess-svelte";

export default defineConfig({
  outDir: "build",
  trailingSlash: "never",
  integrations: [
    svelte({
      preprocess: [optimizeImports()],
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
