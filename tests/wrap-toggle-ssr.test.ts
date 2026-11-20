import fs from "node:fs";
import path from "node:path";
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

// Server-compiles every `.svelte` file on load, because WrapToggle
// imports ToolbarButton.
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

describe("WrapToggle SSR", () => {
  it("renders unpressed by default with the fallback text", async () => {
    const { default: WrapToggle } = await import("../src/WrapToggle.svelte");

    const { body } = render(WrapToggle, { props: {} });

    expect(body).toContain('aria-pressed="false"');
    expect(body).toContain('aria-label="Wrap"');
    expect(body).toContain("Wrap");
  });

  it("renders pressed when wrap is true, with the same label", async () => {
    const { default: WrapToggle } = await import("../src/WrapToggle.svelte");

    const { body } = render(WrapToggle, { props: { wrap: true } });

    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('aria-label="Wrap"');
    expect(body).toContain('title="Wrap"');
    expect(body).toContain("<svg");
  });

  it("renders a ToolbarButton with its shared class", async () => {
    const { default: WrapToggle } = await import("../src/WrapToggle.svelte");

    const { body } = render(WrapToggle, { props: { class: "mine" } });

    expect(body).toMatch(
      /<button[^>]*class="shl-toolbar-button mine svelte-[\w-]+"/,
    );
    expect(body).toContain('type="button"');
  });
});
