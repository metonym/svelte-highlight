import hljsFactory from "highlight.js/lib/core";
import patchedCss from "../scripts/hljs-patches/css.js";
import { createRegistry } from "../src/engine.js";
import css from "../src/languages/css.js";

// scripts/hljs-patches/css.js: properties missing from the stock list.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("css", patchedCss.register);

const registry = createRegistry();
registry.register(css.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "css" }).value;
  const actual = registry.highlight(code, { language: "css" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

function attribute(name: string) {
  return `<span class="hljs-attribute">${name}</span>`;
}

describe("css grammar patch", () => {
  it("styles anchor positioning properties", () => {
    const html = expectMatchesHljs(
      ".tip {\n  position-anchor: --btn;\n  position-area: top;\n  position-try-fallbacks: flip-block;\n  position-try-order: most-height;\n  anchor-scope: all;\n}",
    );
    for (const name of [
      "position-area",
      "position-try-fallbacks",
      "position-try-order",
      "anchor-scope",
    ])
      expect(html).toContain(attribute(name));
    expect(html).toContain(attribute("position-anchor"));
  });

  it("styles text, sizing, and scrolling properties", () => {
    const html = expectMatchesHljs(
      ":root { interpolate-size: allow-keywords; }\nh1 { text-box: trim-both cap alphabetic; text-box-trim: trim-start; text-autospace: normal; }\n.list { reading-flow: grid-order; scroll-marker-group: after; }\n.card { view-transition-class: card; }",
    );
    for (const name of [
      "interpolate-size",
      "text-box",
      "text-box-trim",
      "text-autospace",
      "reading-flow",
      "scroll-marker-group",
      "view-transition-class",
    ])
      expect(html).toContain(attribute(name));
  });

  it("styles font-width as a whole name", () => {
    const html = expectMatchesHljs(
      "h1 { font-width: condensed; font-stretch: 75%; font-weight: 700; }",
    );
    expect(html).toContain(attribute("font-width"));
    expect(html).toContain(attribute("font-stretch"));
    expect(html).toContain(attribute("font-weight"));
  });

  it("keeps stock properties unchanged", () => {
    const html = expectMatchesHljs(
      ".a { position: absolute; text-align: center; anchor-name: --a; }",
    );
    expect(html).toContain(attribute("position"));
    expect(html).toContain(attribute("text-align"));
    expect(html).toContain(attribute("anchor-name"));
  });
});
