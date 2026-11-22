// @depends-on tests/highlight-tokens/**
import fs from "node:fs";
import path from "node:path";
import { compile, parse } from "svelte/compiler";
import { render } from "svelte/server";
import rust from "../src/languages/rust.js";
import github from "../src/themes/github.js";
import "./svelte-server.ts";

const COMPONENT = path.join(import.meta.dir, "../src/HighlightTokens.svelte");
const FIXTURES = path.join(import.meta.dir, "highlight-tokens");

const MARKUP = new Set([
  "RegularElement",
  "SvelteElement",
  "SvelteHead",
  "SvelteWindow",
  "SvelteDocument",
  "SvelteBody",
  "HtmlTag",
  "Text",
]);

/** Template node types in `node`, skipping whitespace-only text. */
function nodeTypes(node: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(node)) {
    for (const child of node) nodeTypes(child, found);
  } else if (node && typeof node === "object") {
    const { type, data } = node as { type?: string; data?: string };
    if (type && !(type === "Text" && data?.trim() === "")) found.add(type);
    for (const [key, value] of Object.entries(node)) {
      if (key !== "instance" && key !== "module") nodeTypes(value, found);
    }
  }
  return found;
}

describe("HighlightTokens", () => {
  it("has no markup of its own, so any renderer can compile it", () => {
    const ast = parse(fs.readFileSync(COMPONENT, "utf8"), { modern: true });
    const markup = [...nodeTypes(ast.fragment)].filter((t) => MARKUP.has(t));
    expect(markup).toEqual([]);
  });

  it("compiles for a custom renderer without warnings", () => {
    const { warnings } = compile(fs.readFileSync(COMPONENT, "utf8"), {
      filename: COMPONENT,
      generate: "client",
      experimental: { customRenderer: path.join(FIXTURES, "renderer.ts") },
    });
    expect(warnings).toEqual([]);
  });

  it("renders through a custom renderer and updates", () => {
    const run = Bun.spawnSync(
      [process.execPath, path.join(FIXTURES, "run.ts")],
      { stderr: "pipe" },
    );
    expect(run.stderr.toString()).toBe("");
    const { before, after } = JSON.parse(run.stdout.toString());
    const text = (color: string, value: string) => [
      "text",
      { fg: color },
      value,
    ];
    expect(before).toEqual([
      [
        "box",
        {},
        [
          "line",
          {},
          text("#d73a49", "fn"),
          text("#24292e", " "),
          text("#6f42c1", "a"),
          text("#24292e", "() {}"),
        ],
        [
          "line",
          {},
          text("#d73a49", "let"),
          text("#24292e", " "),
          text("#005cc5", "b"),
          text("#24292e", " = "),
          text("#005cc5", "1"),
          text("#24292e", ";"),
        ],
      ],
    ]);
    expect(after).toEqual([["box", {}, ["line", {}, text("#24292e", "x")]]]);
  });

  it("renders HTML through the same snippets under the DOM", async () => {
    const { default: Html } = await import("./highlight-tokens/Html.svelte");
    const { body } = render(Html, {
      props: { code: "fn a() {}\nlet", language: rust, theme: github },
    });
    // Without Svelte's hydration markers.
    expect(body.replaceAll(/<!--.*?-->/g, "")).toBe(
      '<pre style="color: #24292e; background: #ffffff;">' +
        '<span style="color: #d73a49;">fn</span>' +
        '<span style="color: #24292e;"> </span>' +
        '<span style="color: #6f42c1;">a</span>' +
        '<span style="color: #24292e;">() {}</span>\n' +
        '<span style="color: #d73a49;">let</span></pre>',
    );
  });

  it("passes plain tokens without a theme", async () => {
    const { default: Html } = await import("./highlight-tokens/Html.svelte");
    const { body } = render(Html, { props: { code: "fn", language: rust } });
    expect(body).toContain("<span>fn</span>");
  });
});
