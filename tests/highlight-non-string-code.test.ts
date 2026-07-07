import fs from "node:fs";
import path from "node:path";
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";

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

describe("non-string code does not crash hljs during SSR", () => {
  it("Highlight renders a number without throwing", async () => {
    const { default: Highlight } = await import(
      path.join(srcDir, "Highlight.svelte")
    );

    const { body } = render(Highlight, {
      props: { language: typescript, code: 42 },
    });

    expect(body).toContain("42");
  });

  it("Highlight renders undefined code as empty output without throwing", async () => {
    const { default: Highlight } = await import(
      path.join(srcDir, "Highlight.svelte")
    );

    expect(() =>
      render(Highlight, {
        props: { language: typescript, code: undefined },
      }),
    ).not.toThrow();
  });

  it("HighlightAuto renders a number without throwing", async () => {
    const { default: HighlightAuto } = await import(
      path.join(srcDir, "HighlightAuto.svelte")
    );

    expect(() =>
      render(HighlightAuto, {
        props: { code: 42 },
      }),
    ).not.toThrow();
  });

  it("HighlightSvelte renders a number without throwing", async () => {
    const { default: HighlightSvelte } = await import(
      path.join(srcDir, "HighlightSvelte.svelte")
    );

    expect(() =>
      render(HighlightSvelte, {
        props: { code: 42 },
      }),
    ).not.toThrow();
  });
});
