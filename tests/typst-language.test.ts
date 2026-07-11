import { createRegistry } from "../src/engine.js";

import typst from "../src/languages/typst";

const registry = createRegistry();

registry.register(typst.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "typst" }).value;

test("typst highlights #let code-mode keyword and string value", () => {
  const result = highlight('#let name = "World"');

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;World&quot;</span>',
  );
});

test("typst highlights #set code-mode keyword, function call, and unit number", () => {
  const result = highlight("#set text(size: 12pt)");

  expect(result).toContain('<span class="hljs-keyword">set</span>');
  expect(result).toContain('<span class="hljs-title function_">text</span>');
  expect(result).toContain('<span class="hljs-number">12pt</span>');
});

test("typst highlights #show code-mode keyword", () => {
  const result = highlight("#show heading: it => it.body");

  expect(result).toContain('<span class="hljs-keyword">show</span>');
});

test("typst highlights headings", () => {
  expect(highlight("= Introduction")).toContain(
    '<span class="hljs-title">= Introduction</span>',
  );
  expect(highlight("== Section")).toContain(
    '<span class="hljs-title">== Section</span>',
  );
});

test("typst highlights strong and emphasis markup", () => {
  const result = highlight("This is *bold* and _emphasis_.");

  expect(result).toContain('<span class="hljs-strong">*bold*</span>');
  expect(result).toContain('<span class="hljs-emphasis">_emphasis_</span>');
});

test("typst highlights line and block comments", () => {
  const result = highlight("// a comment\n/* block */");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-comment">/* block */</span>');
});

test("typst highlights math mode", () => {
  const result = highlight("$ x^2 + y^2 = z^2 $");

  expect(result).toContain(
    '<span class="hljs-string">$ x^2 + y^2 = z^2 $</span>',
  );
});

test("typst highlights labels, references, and unit numbers", () => {
  const result = highlight("See @intro and <label-here>.");

  expect(result).toContain('<span class="hljs-symbol">@intro</span>');
  expect(result).toContain(
    '<span class="hljs-symbol">&lt;label-here&gt;</span>',
  );

  const numbers = highlight("A width of 50% and 12pt margin.");
  expect(numbers).toContain('<span class="hljs-number">50%</span>');
  expect(numbers).toContain('<span class="hljs-number">12pt</span>');
});
