const node = require("@sveltejs/adapter-node");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: node(),
    target: "#svelte",
  },
};
