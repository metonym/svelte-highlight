import { createRegistry, registerAll } from "../src/engine.js";

import ejs from "../src/languages/ejs";

const registry = createRegistry();

registerAll(registry, ejs);

const highlight = (code: string) =>
  registry.highlight(code, { language: "ejs" }).value;

test("ejs highlights output tag delimiters", () => {
  const result = highlight("<%= user.name %>");

  expect(result).toContain('<span class="hljs-template-tag">&lt;%=</span>');
  expect(result).toContain('<span class="hljs-template-tag">%&gt;</span>');
});

test("ejs highlights unescaped output tags", () => {
  const result = highlight("<%- rawHtml %>");

  expect(result).toContain('<span class="hljs-template-tag">&lt;%-</span>');
});

test("ejs highlights comment tags", () => {
  const result = highlight("<%# a comment %>");

  expect(result).toContain(
    '<span class="hljs-comment">&lt;%# a comment %&gt;</span>',
  );
});

test("ejs highlights javascript keywords inside scriptlet tags", () => {
  const result = highlight("<% if (loggedIn) { %>");

  expect(result).toContain('<span class="hljs-keyword">if</span>');
});

test("ejs highlights the surrounding html", () => {
  const result = highlight("<ul><li><%= item %></li></ul>");

  expect(result).toContain('<span class="hljs-tag">');
});
