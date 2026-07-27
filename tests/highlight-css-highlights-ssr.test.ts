/**
 * `resolveEngine` falls back to `"dom"` on the server (no `CSS` global), so
 * `Highlight` with `engine="css-highlights"` must render identically to
 * `engine="dom"` during SSR - the client-side swap to a single text node
 * plus painted ranges happens after hydration (see css-highlights.js).
 */
import fs from "node:fs";
import path from "node:path";
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";
import atomOneDark from "../src/themes/atom-one-dark.js";

plugin({
  name: "svelte-server-compile",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, ({ path: filePath }) => {
      const source = fs.readFileSync(filePath, "utf-8");
      const { js } = compile(source, {
        generate: "server",
        filename: path.basename(filePath),
      });
      return { contents: js.code, loader: "js" };
    });
  },
});

const srcDir = path.join(import.meta.dir, "../src");

describe("Highlight css-highlights engine - SSR fallback", () => {
  it('renders the same span markup as engine="dom", with no CSS reference errors', async () => {
    const { default: Highlight } = await import(
      path.join(srcDir, "Highlight.svelte")
    );

    const code = "const add = (a, b) => a + b;";
    const domResult = render(Highlight, {
      props: { language: typescript, code, engine: "dom" },
    });
    const cssHighlightsResult = render(Highlight, {
      props: {
        language: typescript,
        code,
        engine: "css-highlights",
        theme: atomOneDark,
      },
    });

    expect(cssHighlightsResult.body).toBe(domResult.body);
    expect(cssHighlightsResult.body).toContain("hljs-keyword");
  });
});
