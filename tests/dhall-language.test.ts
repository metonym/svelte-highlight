import hljs from "highlight.js/lib/core";
import dhall from "../src/languages/dhall";

hljs.registerLanguage(dhall.name, dhall.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "dhall" }).value;

test("dhall highlights let/in keywords", () => {
  const result = highlight("let x = 1 in x");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
});

test("dhall highlights builtin types", () => {
  const result = highlight("let n : Natural = 1");

  expect(result).toContain('<span class="hljs-type">Natural</span>');
});

test("dhall highlights namespaced builtins", () => {
  const result = highlight("Natural/fold 3");

  expect(result).toContain('<span class="hljs-built_in">Natural/fold</span>');
});

test("dhall highlights literals", () => {
  const result = highlight("let b = True");

  expect(result).toContain('<span class="hljs-literal">True</span>');
});
