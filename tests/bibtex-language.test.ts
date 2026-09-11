import { createRegistry } from "../src/engine.js";

import bibtex from "../src/languages/bibtex";

const registry = createRegistry();

registry.register(bibtex.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bibtex" }).value;

test("bibtex highlights entry types as keywords", () => {
  const result = highlight("@article{key, year = 2020}");

  expect(result).toContain('<span class="hljs-keyword">@article</span>');
});

test("bibtex highlights field names as attributes", () => {
  const result = highlight("@book{key, author = {Doe}}");

  expect(result).toContain('<span class="hljs-attr">author</span>');
});

test("bibtex highlights braced and quoted values", () => {
  const result = highlight('@misc{k, title = {Hi}, note = "n"}');

  expect(result).toContain('<span class="hljs-string">{Hi}</span>');
  expect(result).toContain('<span class="hljs-string">&quot;n&quot;</span>');
});

test("bibtex highlights numeric values", () => {
  const result = highlight("@article{k, year = 2020}");

  expect(result).toContain('<span class="hljs-number">2020</span>');
});

test("bibtex highlights the citation key as a title", () => {
  const result = highlight("@article{einstein1905, year = 1905}");

  expect(result).toContain('<span class="hljs-keyword">@article</span>');
  expect(result).toContain('<span class="hljs-title">einstein1905</span>');
});

test("bibtex highlights a quoted @preamble value instead of treating it as a key", () => {
  const result = highlight('@preamble{"foo {bar} baz"}');

  expect(result).toContain('<span class="hljs-keyword">@preamble</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;foo {bar} baz&quot;</span>',
  );
  expect(result).not.toContain('<span class="hljs-title">');
});

test("bibtex still highlights a keyed @string name and its quoted value", () => {
  const result = highlight('@string{jgr = "J. Geophys. Res."}');

  expect(result).toContain('<span class="hljs-keyword">@string</span>');
  expect(result).toContain('<span class="hljs-title">jgr</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;J. Geophys. Res.&quot;</span>',
  );
});
