import hljs from "highlight.js/lib/core";
import liquid from "../src/languages/liquid";

hljs.registerLanguage(liquid.name, liquid.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "liquid" }).value;

test("liquid highlights output objects", () => {
  const result = highlight("{{ product.title }}");

  expect(result).toContain("hljs-template-variable");
});

test("liquid highlights tags and keywords", () => {
  const result = highlight("{% if user %}hi{% endif %}");

  expect(result).toContain("hljs-template-tag");
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">endif</span>');
});

test("liquid highlights filters", () => {
  const result = highlight("{{ name | upcase }}");

  expect(result).toContain('<span class="hljs-built_in">upcase</span>');
});

test("liquid delegates surrounding markup to xml", () => {
  const result = highlight("<h1>{{ title }}</h1>");

  expect(result).toContain("hljs-tag");
});
