/**
 * SSR coverage for `HighlightStyle`'s `ThemePalette` object path: no
 * `<style>` tag / `<svelte:head>` content, inline vars present on the
 * wrapper, and the string path's legacy output is unchanged (follows the
 * `tests/highlight-editable-ssr.test.ts` compile pattern).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const componentPath = path.join(
  import.meta.dir,
  "../src/HighlightStyle.svelte",
);

async function compileForServer() {
  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "HighlightStyle.svelte",
  });

  // Written alongside the component (not in tests/) so its relative
  // imports (e.g. "./theme-style.js") resolve.
  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-highlight-style.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

const lightPalette = {
  name: "test-light",
  colorScheme: "light",
  vars: { "--shl-fg": "#000000", "--shl-bg": "#ffffff" },
};

const darkPalette = {
  name: "test-dark",
  colorScheme: "dark",
  vars: { "--shl-fg": "#ffffff", "--shl-bg": "#000000" },
};

describe("HighlightStyle SSR", () => {
  it("inlines vars on the wrapper and renders no <style>/<svelte:head> content for a single palette", async () => {
    const { default: HighlightStyle } = await compileForServer();

    const { head, body } = render(HighlightStyle, {
      props: { theme: lightPalette },
    });

    expect(head).not.toContain("<style>");
    expect(body).not.toContain("<style>");
    expect(body).toContain("--shl-fg:#000000");
    expect(body).toContain("--shl-bg:#ffffff");
  });

  it("merges a light/dark palette pair via light-dark() with color-scheme", async () => {
    const { default: HighlightStyle } = await compileForServer();

    const { head, body } = render(HighlightStyle, {
      props: { light: lightPalette, dark: darkPalette, mode: "auto" },
    });

    expect(head).not.toContain("<style>");
    expect(body).toContain("light-dark(#000000, #ffffff)");
    expect(body).toContain("color-scheme:light dark");
  });

  it("keeps the legacy string path unchanged: scoped <style> in head, no inline vars", async () => {
    const { default: HighlightStyle } = await compileForServer();

    const { head, body } = render(HighlightStyle, {
      props: { theme: "<style>.hljs{color:red}</style>" },
    });

    expect(head).toContain("<style>");
    expect(head).toContain(".hljs{color:red}");
    expect(body).not.toContain("--shl-");
  });
});
