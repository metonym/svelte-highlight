const static = require("@sveltejs/adapter-static");
const carbon = require("carbon-components-svelte/preprocess");
const { name, version, dependencies, homepage } = require("../package.json");

const BASE = process.env.BASE === "true";
const BASE_PATH = `/${name}`;
const paths = BASE ? { base: BASE_PATH } : {};

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: [
    carbon.optimizeCarbonImports(),
    {
      script: ({ content }) => {
        return {
          code: content
            .replace(/process.env.NAME/g, JSON.stringify(name))
            .replace(/process.env.VERSION$/g, JSON.stringify(version))
            .replace(
              /process.env.VERSION_HLJS/g,
              JSON.stringify(dependencies["highlight.js"])
            )
            .replace(/process.env.HOMEPAGE/g, JSON.stringify(homepage)),
        };
      },
    },
  ],
  kit: {
    adapter: static(),
    target: "#svelte",
    appDir: "app",
    paths,
    vite: { optimizeDeps: ["copy-to-clipboard"] },
  },
};
