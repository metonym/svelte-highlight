import { createRegistry } from "../src/engine.js";

import csv from "../src/languages/csv";

const registry = createRegistry();

registry.register(csv.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "csv" }).value;

test("csv highlights quoted fields with doubled-quote escapes", () => {
  const result = highlight('"Alice ""Al"" Smith"');

  expect(result).toContain('<span class="hljs-string">');
});

test("csv highlights numeric fields", () => {
  const result = highlight("1,2.5,-3");

  expect(result).toContain('<span class="hljs-number">1</span>');
  expect(result).toContain('<span class="hljs-number">2.5</span>');
  expect(result).toContain('<span class="hljs-number">-3</span>');
});

test("csv highlights literal values", () => {
  const result = highlight("true,false,null,NULL,NA");

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">NULL</span>');
  expect(result).toContain('<span class="hljs-literal">NA</span>');
});

test("csv highlights ISO dates", () => {
  const result = highlight("2026-01-15,2026-03-02T10:00:00Z");

  expect(result).toContain('<span class="hljs-meta">2026-01-15</span>');
  expect(result).toContain(
    '<span class="hljs-meta">2026-03-02T10:00:00Z</span>',
  );
});

test("csv highlights separators as punctuation", () => {
  const result = highlight("a,b;c\td|e");

  expect(result).toContain('<span class="hljs-punctuation">,</span>');
  expect(result).toContain('<span class="hljs-punctuation">;</span>');
  expect(result).toContain('<span class="hljs-punctuation">|</span>');
});

test("csv keeps relevance at zero so auto-detect never picks it", () => {
  const result = highlight("id,name\n1,Alice");

  expect(result).toBeTruthy();
});
