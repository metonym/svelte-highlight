import { tokenizeTypewriter, unitText } from "../src/typewriter-units.js";

describe("unitText", () => {
  it("returns an empty string for no units", () => {
    expect(unitText([])).toBe("");
  });

  it("drops tags and keeps the visible text", () => {
    const units = tokenizeTypewriter(
      '<span class="hljs-keyword">const</span> a = <span class="hljs-number">1</span>;',
    );
    expect(unitText(units)).toBe("const a = 1;");
  });

  it("decodes the named entities that highlighting emits", () => {
    const units = tokenizeTypewriter(
      "a &lt; b &amp;&amp; c &gt; d &quot;e&quot;",
    );
    expect(unitText(units)).toBe('a < b && c > d "e"');
  });

  it("decodes decimal and hex numeric entities", () => {
    expect(unitText(tokenizeTypewriter("&#39;x&#x27;"))).toBe("'x'");
  });

  it("leaves unknown entities as written", () => {
    expect(unitText(tokenizeTypewriter("&copy;"))).toBe("&copy;");
  });

  it("keeps newlines", () => {
    expect(unitText(tokenizeTypewriter("a\nb"))).toBe("a\nb");
  });
});
