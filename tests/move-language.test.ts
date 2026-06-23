import hljs from "highlight.js/lib/core";
import move from "../src/languages/move";

hljs.registerLanguage(move.name, move.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "move" }).value;

test("move highlights module and fun declarations", () => {
  const result = highlight("module addr::Coin { public fun mint() {} }");

  expect(result).toContain('<span class="hljs-keyword">module</span>');
  expect(result).toContain('<span class="hljs-keyword">fun</span>');
  expect(result).toContain('<span class="hljs-title function_">mint</span>');
});

test("move highlights integer types", () => {
  const result = highlight("let x: u64 = 1;");

  expect(result).toContain('<span class="hljs-type">u64</span>');
});

test("move highlights address literals", () => {
  const result = highlight("use @0x1::coin;");

  expect(result).toContain('<span class="hljs-symbol">@0x1</span>');
});

test("move highlights typed number literals", () => {
  const result = highlight("let n = 100;");

  expect(result).toContain('<span class="hljs-number">100</span>');
});
