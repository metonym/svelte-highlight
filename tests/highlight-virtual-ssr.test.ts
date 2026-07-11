import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";

const componentPath = path.join(
  import.meta.dir,
  "../src/HighlightVirtual.svelte",
);

async function compileForServer() {
  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "HighlightVirtual.svelte",
  });

  // Written alongside the component (not in tests/) so its relative
  // imports (e.g. "./tokenized-document.js") resolve.
  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-highlight-virtual.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

describe("HighlightVirtual SSR", () => {
  it("renders the full code as plain escaped text, not tokenized HTML", async () => {
    const { default: HighlightVirtual } = await compileForServer();

    const lines = Array.from({ length: 50 }, (_, i) => `const x${i} = ${i};`);
    const code = `${lines.join("\n")}\na < b`;

    const { body } = render(HighlightVirtual, {
      props: { language: typescript, code },
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
});
