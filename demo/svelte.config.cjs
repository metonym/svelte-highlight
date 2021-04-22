const static = require("@sveltejs/adapter-static");
const carbon = require("carbon-components-svelte/preprocess");
const { name } = require("../package.json");

const BASE = process.env.BASE === "true";
const BASE_PATH = `/${name}/`;
const paths = BASE ? { base: BASE_PATH, assets: BASE_PATH } : {};

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: [carbon.optimizeCarbonImports()],
  kit: {
    adapter: static(),
    target: "#svelte",
    paths,
    vite: { optimizeDeps: ["copy-to-clipboard"] },
  },
};
