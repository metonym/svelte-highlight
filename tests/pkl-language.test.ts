import hljs from "highlight.js/lib/core";
import pkl from "../src/languages/pkl";

hljs.registerLanguage(pkl.name, pkl.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "pkl" }).value;

test("pkl highlights function declarations", () => {
  const result = highlight("function add(x) = x");

  expect(result).toContain('<span class="hljs-keyword">function</span>');
  expect(result).toContain('<span class="hljs-title function_">add</span>');
});

test("pkl highlights structural keywords", () => {
  const result = highlight('amends "base.pkl"');

  expect(result).toContain('<span class="hljs-keyword">amends</span>');
});

test("pkl highlights builtin types", () => {
  const result = highlight('name: String = "x"');

  expect(result).toContain('<span class="hljs-type">String</span>');
});

test("pkl highlights strings and numbers", () => {
  const result = highlight('host = "localhost"\nport = 8080');

  expect(result).toContain(
    '<span class="hljs-string">&quot;localhost&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">8080</span>');
});
