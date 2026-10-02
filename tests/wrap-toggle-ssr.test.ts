import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const componentPath = path.join(import.meta.dir, "../src/WrapToggle.svelte");

async function compileForServer() {
  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "WrapToggle.svelte",
  });

  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-wrap-toggle.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

describe("WrapToggle SSR", () => {
  it("renders unpressed by default with the fallback text", async () => {
    const { default: WrapToggle } = await compileForServer();

    const { body } = render(WrapToggle, { props: {} });

    expect(body).toContain('aria-pressed="false"');
    expect(body).toContain('aria-label="Wrap"');
    expect(body).toContain("Wrap");
  });

  it("renders pressed when wrap is true, with fallback text still Wrap", async () => {
    const { default: WrapToggle } = await compileForServer();

    const { body } = render(WrapToggle, { props: { wrap: true } });

    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('aria-label="Wrapped"');
    expect(body).toContain(">Wrap<");
  });
});
