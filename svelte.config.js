import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { optimizeImports } from "carbon-preprocess-svelte";
import fs from "fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);
const CONTENT = {
  NAME: pkg.name,
  VERSION_PACKAGE: pkg.version,
  VERSION_HLJS: pkg.dependencies["highlight.js"],
  HOMEPAGE: pkg.homepage,
  TS: new Date().toLocaleString(),
};

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: [
    vitePreprocess(),
    optimizeImports(),
    {
      script: ({ content, filename }) => {
        if (/node_modules/.test(filename)) return;
        if (!/demo/.test(filename)) return;

        let code = content;

        Object.entries(CONTENT).map(([key, value]) => {
          code = code.replace(
            new RegExp("process.env." + key, "g"),
            JSON.stringify(value),
          );
        });

        return {
          code,
        };
      },
    },
  ],
  kit: {
    adapter: adapter(),
    files: {
      assets: "demo/static",
      lib: "src",
      routes: "demo/routes",
      appTemplate: "demo/app.html",
    },
  },
};
