import { createRegistry } from "../src/engine.js";

import djot from "../src/languages/djot";

const registry = createRegistry();

registry.register(djot.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "djot" }).value;

test("djot highlights headings", () => {
  const result = highlight("# A demo document");

  expect(result).toContain(
    '<span class="hljs-section"># A demo document</span>',
  );
});

test("djot highlights strong and emphasis", () => {
  const result = highlight("This is *strong* and _emphasis_.");

  expect(result).toContain('<span class="hljs-strong">*strong*</span>');
  expect(result).toContain('<span class="hljs-emphasis">_emphasis_</span>');
});

test("djot highlights attribute blocks with high relevance", () => {
  const result = highlight("{.note #intro}");

  expect(result).toContain('<span class="hljs-meta">{.note #intro}</span>');
});

test("djot highlights task checkboxes and bullets", () => {
  const result = highlight("- [x] task done");

  expect(result).toContain('<span class="hljs-bullet">-</span>');
  expect(result).toContain('<span class="hljs-bullet">[x]</span>');
});

test("djot highlights links and symbols", () => {
  const result = highlight("See the [docs](https://example.com) :smile:");

  expect(result).toContain('<span class="hljs-link">');
  expect(result).toContain('<span class="hljs-symbol">:smile:</span>');
});

test("djot highlights inline verbatim and block quotes", () => {
  const result = highlight("`verbatim`\n> a quote");

  expect(result).toContain('<span class="hljs-code">`verbatim`</span>');
  expect(result).toContain('<span class="hljs-quote">&gt;</span>');
});

test("djot keeps a raw inline format attribute inside the verbatim span", () => {
  const result = highlight("Raw `<b>x</b>`{=html} then {=marked=} and plain.");

  expect(result).toContain(
    '<span class="hljs-code">`&lt;b&gt;x&lt;/b&gt;`{=html}</span>',
  );
  expect(result).toContain('<span class="hljs-mark">{=marked=}</span>');
  expect(result).toContain("</span> and plain.");
});

test("djot only treats a dollar-prefixed verbatim span as math", () => {
  const result = highlight(
    "Inline $`e=mc^2` and display $$`\\int x` cost $5 or $10.",
  );

  expect(result).toContain('<span class="hljs-formula">$`e=mc^2`</span>');
  expect(result).toContain('<span class="hljs-formula">$$`\\int x`</span>');
  expect(result).toContain("cost $5 or $10.");
});

test("djot does not open strong or emphasis on escaped punctuation", () => {
  const result = highlight(
    "\\*not strong\\* and \\_not emphasis\\_ but *strong*",
  );

  expect(result).not.toContain('<span class="hljs-strong">*not strong');
  expect(result).not.toContain('<span class="hljs-emphasis">');
  expect(result).toContain('<span class="hljs-strong">*strong*</span>');
});

test("djot highlights parenthesized and roman-numeral enumerators", () => {
  const result = highlight(
    "(a) first\niv. fourth\n(IV) fourth\nHello. not a list",
  );

  expect(result).toContain('<span class="hljs-bullet">(a)</span> first');
  expect(result).toContain('<span class="hljs-bullet">iv.</span> fourth');
  expect(result).toContain('<span class="hljs-bullet">(IV)</span> fourth');
  expect(result).toContain("\nHello. not a list");
});

test("djot highlights spaced thematic breaks", () => {
  const result = highlight("* * *\n- - -\n- item");

  expect(result).toContain('<span class="hljs-meta">* * *</span>');
  expect(result).toContain('<span class="hljs-meta">- - -</span>');
  expect(result).toContain('<span class="hljs-bullet">-</span> item');
});
