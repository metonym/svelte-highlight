import hljs from "highlight.js/lib/core";
import v from "../src/languages/v";

hljs.registerLanguage(v.name, v.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "v" }).value;

test("v highlights fn declarations", () => {
  const result = highlight("fn main() {}");

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-title function_">main</span>');
});

test("v highlights builtin types", () => {
  const result = highlight("mut x := int(1)");

  expect(result).toContain('<span class="hljs-keyword">mut</span>');
  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("v highlights struct types", () => {
  const result = highlight("struct Point {}");

  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-type">Point</span>');
});

test("v highlights strings and numbers", () => {
  const result = highlight('name := "v"\nport := 8080');

  expect(result).toContain('<span class="hljs-string">&quot;v&quot;</span>');
  expect(result).toContain('<span class="hljs-number">8080</span>');
});
