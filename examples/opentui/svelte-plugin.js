// Compiles every `.svelte` file, including svelte-highlight's
// `HighlightTokens.svelte`, with the opentui renderer. A component and the
// snippets it renders must share a renderer.

import { plugin } from "bun";
import { compile } from "svelte/compiler";

const renderer = new URL("./src/opentui-renderer.js", import.meta.url).pathname;

plugin({
  name: "svelte-opentui",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
      const { js, warnings } = compile(await Bun.file(path).text(), {
        filename: path,
        generate: "client",
        experimental: { customRenderer: renderer },
      });
      for (const warning of warnings) console.warn(warning.message);
      return { contents: js.code, loader: "js" };
    });
  },
});
