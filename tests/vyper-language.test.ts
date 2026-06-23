import hljs from "highlight.js/lib/core";
import vyper from "../src/languages/vyper";

hljs.registerLanguage(vyper.name, vyper.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "vyper" }).value;

test("vyper highlights def declarations", () => {
  const result = highlight("def transfer():\n    pass");

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">transfer</span>',
  );
});

test("vyper highlights value types", () => {
  const result = highlight("amount: uint256 = 0");

  expect(result).toContain('<span class="hljs-type">uint256</span>');
});

test("vyper highlights decorators as meta", () => {
  const result = highlight("@external\ndef f(): pass");

  expect(result).toContain('<span class="hljs-meta">@external</span>');
});

test("vyper highlights hash comments", () => {
  const result = highlight("# a comment\nx: uint256 = 0");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});
