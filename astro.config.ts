import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  outDir: "build",
  trailingSlash: "never",
  integrations: [
    svelte({
      prebundleSvelteLibraries: true,
    }),
  ],
  srcDir: "./www",
  publicDir: "./www/public",
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  vite: {
    define: {
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_VERSION: JSON.stringify(pkg.version),
      __PKG_HOMEPAGE: JSON.stringify(pkg.homepage),
      __PKG_HLJS_VERSION: JSON.stringify(pkg.dependencies["highlight.js"]),
      __TS: JSON.stringify(new Date().toLocaleString()),
    },
  },
});
