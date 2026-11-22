/**
 * `HighlightAutoLazy` loads grammars after mount, so the server renders
 * the code as escaped plain text with no language tag. The client's first
 * render matches, so hydration does not mismatch.
 *
 * Compiles every `.svelte` file for the server on load, as in
 * `tests/highlight-events-ssr.test.ts`.
 */
import fs from "node:fs";
import path from "node:path";
import { render } from "svelte/server";
import "./svelte-server.ts";

describe("HighlightAutoLazy SSR", () => {
  test("renders escaped plain text with no language", async () => {
    const { default: HighlightAutoLazy } =
      await import("../src/HighlightAutoLazy.svelte");
    const code = "body { background: #000; } <b>&</b>";
    const { body } = render(HighlightAutoLazy, {
      props: { code, langtag: true },
    });
    expect(body).toContain(
      "body { background: #000; } &lt;b&gt;&amp;&lt;/b&gt;",
    );
    expect(body).not.toContain("hljs-");
    expect(body).not.toContain("<b>");
    expect(body).toContain('data-language=""');
  });

  test("does not import all.js", () => {
    const source = fs.readFileSync(
      path.join(import.meta.dir, "../src/HighlightAutoLazy.svelte"),
      "utf-8",
    );
    const autoDetect = fs.readFileSync(
      path.join(import.meta.dir, "../src/auto-detect.js"),
      "utf-8",
    );
    for (const text of [source, autoDetect]) {
      expect(text).not.toMatch(/languages\/all(\.js)?["']/);
    }
  });
});
