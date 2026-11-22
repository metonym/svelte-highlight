// @depends-on src/Highlight.svelte
/**
 * There is no `CSS.highlights` on the server, so `Highlight` with
 * `engine="css-highlights"` must render the same markup as the default
 * engine. The client swaps to plain text after mount (tests/e2e).
 */
import path from "node:path";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";
import github from "../src/styles/github.js";
import atomOneDark from "../src/themes/atom-one-dark.js";
import "./svelte-server.ts";

const srcDir = path.join(import.meta.dir, "../src");

describe('Highlight engine="css-highlights" SSR', () => {
  it.each([
    ["a theme string", github],
    ["a ThemePalette", atomOneDark],
  ])("renders the default engine's markup with %s", async (_, theme) => {
    const { default: Highlight } = await import(
      path.join(srcDir, "Highlight.svelte")
    );
    const code = "const add = (a, b) => a + b;";

    const dom = render(Highlight, { props: { language: typescript, code } });
    const css = render(Highlight, {
      props: { language: typescript, code, engine: "css-highlights", theme },
    });

    expect(css.body).toBe(dom.body);
    expect(css.body).toContain('<span class="hljs-keyword">const</span>');
    expect(css.head).not.toContain("::highlight(");
  });
});
