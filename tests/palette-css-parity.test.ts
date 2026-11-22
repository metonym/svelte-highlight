// @depends-on scripts/build-themes.ts scripts/build-styles.ts scripts/custom-styles/**
/**
 * Each theme's palette (`themes/<name>`, through `base.css`) must paint the
 * same colors as its theme CSS (`styles/<name>`). `theme-fidelity` checks
 * the palette's declarations one way. This checks what they compute to,
 * per run of text, through the cascade both the "css-highlights" engine and
 * `styleTokens` use.
 */
import { createRegistry, registerAll } from "../src/engine.js";
import type { ScopeEvent } from "../src/engine.js";
import { cascadeRanges, createThemeCascade } from "../src/highlight-cascade.js";
import css from "../src/languages/css.js";
import diff from "../src/languages/diff.js";
import markdown from "../src/languages/markdown.js";
import rust from "../src/languages/rust.js";
import typescript from "../src/languages/typescript.js";
import xml from "../src/languages/xml.js";
import * as styles from "../src/styles/index.js";
import type { ThemePalette } from "../src/theme.d.ts";
import * as themes from "../src/themes/index.js";

const SAMPLES = {
  rust: [
    "/// doc `x`",
    "#[derive(Debug)]",
    "pub struct A<T> { x: &'static str }",
    'fn main() { let x: u32 = 1; println!("hi {x}"); }',
  ].join("\n"),
  markdown:
    "# Title\n\n*em* **strong** `code` [link](http://x)\n> quote\n- item",
  typescript: [
    "/** @param {string} a */",
    "class A extends B { #p = 1; async f(): Promise<void> { return `t${1}`; } }",
  ].join("\n"),
  diff: "--- a\n+++ b\n@@ -1 +1 @@\n-old\n+new",
  xml: '<?xml version="1.0"?>\n<a href="x"><!-- c --><![CDATA[x]]></a>',
  css: "@media screen { .a > #b::before { color: red !important; } }",
};

const registry = createRegistry();
for (const language of [css, diff, markdown, rust, typescript, xml]) {
  registerAll(registry, language);
}
const streams = Object.entries(SAMPLES).map(
  ([language, code]) =>
    [language, registry.highlight(code, { language }).events] as const,
);

/** The block's colors, then `[text, color, background]` per painted run. */
function paint(theme: string | ThemePalette, events: ScopeEvent[]) {
  const cascade = createThemeCascade(theme);
  const source = events.map((event) => (event.t === 0 ? event.v : "")).join("");
  const { ranges, styles: runStyles } = cascadeRanges(events, cascade);
  return {
    block: [cascade.root.color, cascade.root.background],
    runs: ranges.map((range) => {
      const style = runStyles[Number(range.scope.slice(1))];
      return [
        source.slice(range.start, range.end),
        style?.color,
        style?.background,
      ];
    }),
  };
}

const pairs = Object.entries(themes).map(([name, palette]) => {
  const style = (styles as Record<string, string | undefined>)[name];
  return [palette.name, palette, style] as const;
});

test("every palette has its theme CSS", () => {
  expect(pairs.length).toBeGreaterThan(300);
  expect(pairs.filter(([, , style]) => style === undefined)).toEqual([]);
});

test.each(pairs)(
  "%s paints the same colors as its theme CSS",
  (_name, palette, style) => {
    for (const [, events] of streams) {
      expect(paint(palette, events)).toEqual(paint(style as string, events));
    }
  },
);
