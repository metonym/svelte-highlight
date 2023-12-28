import svelte from "@astrojs/svelte";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "astro/config";
import { optimizeImports } from "carbon-preprocess-svelte";

// https://astro.build/config
export default defineConfig({
  outDir: "build",
  trailingSlash: "never",
  integrations: [
    svelte({
      preprocess: [
        vitePreprocess(),
        optimizeImports(),
        {
          script: ({ content, filename }) => {
            if (/node_modules/.test(filename)) return;

            content = content.replace(
              new RegExp("process.env.TS", "g"),
              JSON.stringify(new Date().toLocaleString()),
            );

            return {
              code: content,
            };
          },
        },
      ],
    }),
  ],
  srcDir: "./www",
  publicDir: "./www/public",
  vite: {
    optimizeDeps: {
      // We use the `optimizeImports` preprocessor so we
      // don't need Vite to do redundant work here.
      exclude: ["carbon-components-svelte"],
    },
  },
});
