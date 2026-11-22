// Every `.svelte` file compiles with this renderer, svelte-highlight's
// `HighlightTokens.svelte` included: a component and the snippets it
// renders must share one. svelte-bun also resolves `svelte` to the
// runtime that supports custom renderers.
export default {
  compilerOptions: {
    experimental: { customRenderer: "./src/opentui-renderer.js" },
  },
};
