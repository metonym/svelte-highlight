const static = require("@sveltejs/adapter-static");
const { name } = require("../package.json");

const BASE = process.env.BASE === "true";
const BASE_PATH = `/${name}/`;

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: [
    require("carbon-components-svelte/preprocess").optimizeCarbonImports(),
  ],
  kit: {
    adapter: static(),
    target: "#svelte",
    paths: {
      base: BASE ? BASE_PATH : undefined,
      assets: BASE ? BASE_PATH : undefined,
    },
    ssr: false,
    vite: { optimizeDeps: ["carbon-components-svelte", "clipboard-copy"] },
  },
};
