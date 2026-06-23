import hljs from "highlight.js/lib/core";
import razor from "../src/languages/razor";

hljs.registerLanguage(razor.name, razor.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "razor" }).value;

test("razor highlights directives as meta", () => {
  const result = highlight("@page\n@model Foo");

  expect(result).toContain('<span class="hljs-meta">@page</span>');
  expect(result).toContain('<span class="hljs-meta">@model</span>');
});

test("razor highlights inline expressions", () => {
  const result = highlight("<div>@Name</div>");

  expect(result).toContain('<span class="hljs-template-variable">@Name</span>');
});

test("razor highlights html tags", () => {
  const result = highlight("<div></div>");

  expect(result).toContain('<span class="hljs-tag">');
});

test("razor highlights razor comments", () => {
  const result = highlight("@* a comment *@");

  expect(result).toContain('<span class="hljs-comment">@* a comment *@</span>');
});
