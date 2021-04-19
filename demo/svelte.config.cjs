const static = require("@sveltejs/adapter-static");
const pkg = require("./package.json");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: static(),
    target: "#svelte",

    vite: {
      base: "/",
    },
  },
};
