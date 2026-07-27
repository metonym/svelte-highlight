import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";

const componentPath = path.join(
  import.meta.dir,
  "../src/HighlightStream.svelte",
);

async function compileForServer() {
  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "HighlightStream.svelte",
  });

  // Written alongside the component (not in tests/) so its relative imports
  // (e.g. "./tokenized-document.js") resolve.
  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-highlight-stream.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

describe("HighlightStream `virtualize` SSR", () => {
  it("renders the full code as plain escaped text, not tokenized HTML", async () => {
    const { default: HighlightStream } = await compileForServer();

    const lines = Array.from({ length: 50 }, (_, i) => `const x${i} = ${i};`);
    const code = `${lines.join("\n")}\na < b`;

    const { body } = render(HighlightStream, {
      props: { language: typescript, code, virtualize: true },
    });

    // No tokenization: no scope spans, no windowed-line markup (the hidden
    // line-height probe legitimately renders even pre-hydration, but it
    // carries no `data-line`).
    expect(body).not.toContain("hljs-keyword");
    expect(body).not.toContain("data-line");
    expect(body).not.toContain("shl-virtual-sizer");
    expect(body).not.toContain("shl-virtual-window");

    // The full document is present, plain-text-escaped.
    expect(body).toContain("a &lt; b");
    for (const line of lines) expect(body).toContain(line);
  });

  it("non-virtualized SSR is unaffected (still highlights up front)", async () => {
    const { default: HighlightStream } = await compileForServer();

    const { body } = render(HighlightStream, {
      props: { language: typescript, code: "const a: number = 1;" },
    });

    expect(body).toContain("hljs-keyword");
    expect(body).not.toContain("shl-virtual");
  });
});
