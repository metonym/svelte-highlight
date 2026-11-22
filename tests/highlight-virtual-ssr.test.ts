// @depends-on src/HighlightVirtual.svelte
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
  it("renders the first 100 lines highlighted and the rest as plain text", async () => {
    const { default: HighlightVirtual } = await compileForServer();

    const lines = Array.from({ length: 150 }, (_, i) => `const x${i} = ${i};`);
    const code = `${lines.join("\n")}\na < b`;

    const { body } = render(HighlightVirtual, {
      props: { language: typescript, code },
    });

    // No windowed-line markup before hydration (the hidden line-height probe
    // legitimately renders, but it carries no `data-line`).
    expect(body).not.toContain("data-line");
    expect(body).not.toContain("shl-virtual-sizer");
    expect(body).not.toContain("shl-virtual-window");

    // Lines 1-100 highlighted, the rest plain text.
    const keywords =
      body.match(/<span class="hljs-keyword">const<\/span>/g) ?? [];
    expect(keywords).toHaveLength(100);
    expect(body.replace(/<!--[^]*?-->/g, "")).toContain(
      "\nconst x100 = 100;\n",
    );
    expect(body).toContain("a &lt; b");

    // The text is the whole document, unchanged.
    const text = body
      .slice(body.indexOf("<code"), body.indexOf("</code>"))
      .replace(/<!--[^]*?-->/g, "")
      .replace(/<[^>]+>/g, "")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#x27;", "'")
      .replaceAll("&amp;", "&");
    expect(text).toBe(code);
  });

  it("keeps a trailing newline in a short document", async () => {
    const { default: HighlightVirtual } = await compileForServer();
    const code = "let a = 1;\nlet b = 2;\n";
    const { body } = render(HighlightVirtual, {
      props: { language: typescript, code },
    });
    const text = body
      .slice(body.indexOf("<code"), body.indexOf("</code>"))
      .replace(/<!--[^]*?-->/g, "")
      .replace(/<[^>]+>/g, "");
    expect(text).toBe(code);
  });
});
