import adapter from "@sveltejs/adapter-static";
import fs from "fs";
import { optimizeImports } from "carbon-preprocess-svelte";

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")
);
const CONTENT = {
  NAME: pkg.name,
  VERSION_PACKAGE: pkg.version,
  VERSION_HLJS: pkg.dependencies["highlight.js"],
  HOMEPAGE: pkg.homepage,
  TS: new Date().toLocaleString(),
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    optimizeImports(),
    {
      script: ({ content }) => {
        let code = content;

        Object.entries(CONTENT).map(([key, value]) => {
          code = code.replace(
            new RegExp("process.env." + key, "g"),
            JSON.stringify(value)
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
    target: "#svelte",
    files: {
      assets: "demo/static",
      lib: "demo/lib",
      routes: "demo/routes",
      template: "demo/app.html",
    },
    vite: {
      optimizeDeps: {
        include: ["highlight.js/lib/core"],
      },
      server: {
        fs: {
          allow: [".."],
        },
      },
    },
  },
};

export default config;
