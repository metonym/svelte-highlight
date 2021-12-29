import adapter from "@sveltejs/adapter-static";
import fs from "fs";
import { optimizeImports } from "carbon-preprocess-svelte";

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")
);
const { name, version, dependencies, homepage } = pkg;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    optimizeImports(),
    {
      script: ({ content }) => {
        return {
          code: content
            .replace(/process.env.NAME/g, JSON.stringify(name))
            .replace(/process.env.VERSION_PACKAGE/g, JSON.stringify(version))
            .replace(
              /process.env.VERSION_HLJS/g,
              JSON.stringify(dependencies["highlight.js"])
            )
            .replace(/process.env.HOMEPAGE/g, JSON.stringify(homepage))
            .replace(
              /process.env.TS/g,
              JSON.stringify(new Date().toLocaleString())
            ),
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
    prerender: {
      concurrency: 10,
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
