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

test("vyper highlights byte-string literals with a b prefix", () => {
  const result = highlight('x: bytes32 = b"\\x01\\x02"');

  expect(result).toContain(
    '<span class="hljs-string">b&quot;\\x01\\x02&quot;</span>',
  );
});

test("vyper highlights struct, interface, and event names as titles", () => {
  const result = highlight(
    "struct Foo:\n    a: uint256\n\ninterface ERC20:\n    def transfer() -> bool: view\n\nevent Transfer:\n    sender: indexed(address)",
  );

  expect(result).toContain('<span class="hljs-title class_">Foo</span>');
  expect(result).toContain('<span class="hljs-title class_">ERC20</span>');
  expect(result).toContain('<span class="hljs-title class_">Transfer</span>');
});
