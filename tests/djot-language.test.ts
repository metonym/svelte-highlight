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
