import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const componentPath = path.join(
  import.meta.dir,
  "../src/MarkdownStream.svelte",
);

async function compileForServer() {
  // Bun's default `.svelte` loader compiles for the client, so `import
  // HighlightStream from "./HighlightStream.svelte"` inside the generated
  // output would resolve to a mount function, not the `($$renderer, props)`
  // shape `svelte/server` expects. Server-compile it too and rewrite the
  // specifier to point at that copy.
  const highlightStreamPath = path.join(
    import.meta.dir,
    "../src/HighlightStream.svelte",
  );
  const highlightStreamJs = compile(
    fs.readFileSync(highlightStreamPath, "utf-8"),
    { generate: "server", filename: "HighlightStream.svelte" },
  ).js.code;
  const highlightStreamOutPath = path.join(
    import.meta.dir,
    "../src/.tmp-highlight-stream.server.js",
  );

  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "MarkdownStream.svelte",
  });
  const code = js.code.replace(
    'from "./HighlightStream.svelte"',
    'from "./.tmp-highlight-stream.server.js"',
  );

  // Written alongside the component (not in tests/) so its relative imports
  // (e.g. "./fence.js") resolve.
  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-markdown-stream.server.js",
  );
  fs.writeFileSync(highlightStreamOutPath, highlightStreamJs);
  fs.writeFileSync(outPath, code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
    fs.unlinkSync(highlightStreamOutPath);
  }
}

describe("MarkdownStream SSR", () => {
  it("server-renders two fences and one prose block, with no undefined in the markup", async () => {
    const { default: MarkdownStream } = await compileForServer();

    const text = [
      "Here is some intro text.",
      "",
      "```ts",
      "const a: number = 1;",
      "```",
      "",
      "```py",
      'print("hi")',
      "```",
    ].join("\n");

    const { body } = render(MarkdownStream, {
      props: { text, done: true },
    });

    const preCount = (body.match(/<pre/g) ?? []).length;
    expect(preCount).toBe(2);
    expect(body).toContain("shl-md-text");
    expect(body).toContain("Here is some intro text.");
    expect(body).not.toContain("undefined");
  });
});
