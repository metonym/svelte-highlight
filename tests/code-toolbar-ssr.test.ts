import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const componentPath = path.join(import.meta.dir, "../src/CodeToolbar.svelte");

async function compileForServer() {
  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "CodeToolbar.svelte",
  });

  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-code-toolbar.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

describe("CodeToolbar SSR", () => {
  it("renders the language badge and title, with no aria-label when label is unset", async () => {
    const { default: CodeToolbar } = await compileForServer();

    const { body } = render(CodeToolbar, {
      props: { languageName: "typescript", title: "app.ts" },
    });

    expect(body).toContain('role="toolbar"');
    expect(body).toContain('data-language="typescript"');
    expect(body).toContain("typescript");
    expect(body).toContain('title="app.ts"');
    expect(body).not.toContain("aria-label");
  });

  it("renders aria-label when label is set", async () => {
    const { default: CodeToolbar } = await compileForServer();

    const { body } = render(CodeToolbar, {
      props: { label: "Code actions" },
    });

    expect(body).toContain('aria-label="Code actions"');
  });

  it("omits position:sticky from the inline style when sticky is false", async () => {
    const { default: CodeToolbar } = await compileForServer();

    const { body } = render(CodeToolbar, {
      props: { sticky: false },
    });

    expect(body).not.toContain("position:sticky");
  });
});
