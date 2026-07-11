/**
 * Integration coverage proving `defineTheme()` output is a plain
 * `ThemePalette` valid everywhere shipped palettes work: SSR-render
 * `HighlightStyle` with it and assert the inline vars appear (follows the
 * `tests/highlight-style-ssr.test.ts` compile pattern).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { defineTheme } from "../src/theme.js";

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
    "../src/.tmp-theme-integration.server.js",
  );
  fs.writeFileSync(outPath, js.code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
  }
}

describe("defineTheme output through HighlightStyle SSR", () => {
  it("inlines the defineTheme palette's vars with no <style>/<svelte:head> content", async () => {
    const { default: HighlightStyle } = await compileForServer();

    const midnight = defineTheme({
      name: "midnight",
      roles: {
        background: "#0b1021",
        foreground: "#d6deeb",
        comment: { color: "#637777", fontStyle: "italic" },
        keyword: "#c792ea",
      },
      scopes: { "title.class_": "#ffd700" },
    });

    const { head, body } = render(HighlightStyle, {
      props: { theme: midnight },
    });

    expect(head).not.toContain("<style>");
    expect(body).not.toContain("<style>");
    expect(body).toContain("--shl-bg:#0b1021");
    expect(body).toContain("--shl-fg:#d6deeb");
    expect(body).toContain("--shl-comment:#637777");
    expect(body).toContain("--shl-comment-font-style:italic");
    expect(body).toContain("--shl-keyword:#c792ea");
    expect(body).toContain("--shl-title-class_:#ffd700");
  });
});
