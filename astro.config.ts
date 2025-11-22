import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import { optimizeCss, optimizeImports } from "carbon-preprocess-svelte";
import path from "node:path";
import pkg from "./package.json" assert { type: "json" };

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
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  vite: {
    plugins: [optimizeCss()],
    resolve: {
      alias: {
        "@www": path.resolve("./www"),
        "@layouts": path.resolve("./www/layouts"),
        "@components": path.resolve("./www/components"),
        "svelte-highlight": path.resolve("./src"),
      },
    },
    optimizeDeps: {
      exclude: ["carbon-components-svelte"],
    },
    define: {
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_VERSION: JSON.stringify(pkg.version),
      __PKG_HOMEPAGE: JSON.stringify(pkg.homepage),
      __PKG_HLJS_VERSION: JSON.stringify(pkg.dependencies["highlight.js"]),
      __TS: JSON.stringify(new Date().toLocaleString()),
    },
  },
});
