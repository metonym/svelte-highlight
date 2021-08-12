const { svelte } = require("@sveltejs/vite-plugin-svelte");
const { defineConfig } = require("vite");

module.exports = defineConfig(({ mode }) => {
  return {
    plugins: [svelte()],
    build: { minify: mode === "production" },
  };
});
