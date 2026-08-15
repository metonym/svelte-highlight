import {
  buildUnitMarkup,
  tokenizeTypewriter,
} from "../src/typewriter-units.js";

describe("buildUnitMarkup", () => {
  it("returns an empty string for no units", () => {
    expect(buildUnitMarkup([])).toBe("");
  });

  it("wraps each visible character in a hidden typewriter-unit span", () => {
    const units = tokenizeTypewriter("abc");
    expect(buildUnitMarkup(units)).toBe(
      '<span class="typewriter-unit typewriter-hidden">a</span>' +
        '<span class="typewriter-unit typewriter-hidden">b</span>' +
        '<span class="typewriter-unit typewriter-hidden">c</span>',
    );
  });

  it("passes tags through unchanged, without wrapping them", () => {
    const units = tokenizeTypewriter('<span class="hljs-keyword">const</span>');
    const html = buildUnitMarkup(units);
    expect(html.startsWith('<span class="hljs-keyword">')).toBe(true);
    expect(html.endsWith("</span>")).toBe(true);
    // Every visible char is individually wrapped, so "const" (5 chars)
    // becomes 5 typewriter-unit spans between the passthrough tags.
    expect(html.match(/typewriter-unit/g)?.length).toBe(5);
  });

  it("wraps an HTML entity as a single unit despite its multi-character raw text", () => {
    const units = tokenizeTypewriter("a&amp;b");
    expect(buildUnitMarkup(units)).toBe(
      '<span class="typewriter-unit typewriter-hidden">a</span>' +
        '<span class="typewriter-unit typewriter-hidden">&amp;</span>' +
        '<span class="typewriter-unit typewriter-hidden">b</span>',
    );
  });

  it("wraps a surrogate-pair emoji as a single unit", () => {
    const emoji = "\u{1F600}";
    const units = tokenizeTypewriter(emoji);
    expect(buildUnitMarkup(units)).toBe(
      `<span class="typewriter-unit typewriter-hidden">${emoji}</span>`,
    );
  });
});
