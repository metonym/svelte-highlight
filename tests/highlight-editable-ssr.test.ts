import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";

const componentPath = path.join(
  import.meta.dir,
  "../src/HighlightEditable.svelte",
);

async function compileForServer() {
  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "HighlightEditable.svelte",
  });

  // Written alongside the component (not in tests/) so its relative
  // imports (e.g. "./split-lines.js") resolve.
  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-highlight-editable.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

describe("HighlightEditable SSR", () => {
  it("renders the raw code as escaped text instead of an empty block", async () => {
    const { default: HighlightEditable } = await compileForServer();

    const { body } = render(HighlightEditable, {
      props: { language: typescript, code: "a < b" },
    });

    expect(body).not.toContain("<code></code>");
    expect(body).toContain("a &lt; b");
  });
});
