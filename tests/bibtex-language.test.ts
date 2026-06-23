import hljs from "highlight.js/lib/core";
import bibtex from "../src/languages/bibtex";

hljs.registerLanguage(bibtex.name, bibtex.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "bibtex" }).value;

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
