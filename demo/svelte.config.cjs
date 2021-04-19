const static = require("@sveltejs/adapter-static");
const { name } = require("../package.json");

const BASE = `/${name}/`;

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: static(),
    target: "#svelte",
    paths: {
      base: BASE,
      assets: BASE,
    },
  },
};
