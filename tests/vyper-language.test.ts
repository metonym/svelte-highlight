import { createRegistry } from "../src/engine.js";

import vyper from "../src/languages/vyper";

const registry = createRegistry();

registry.register(vyper.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "vyper" }).value;

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

test("vyper highlights 0.4 module statements, external calls, and transient storage", () => {
  const result = highlight(
    "initializes: ownable\nuses: lib\nexports: ownable.transfer_ownership\nlock: transient(bool)\ntotal: uint256 = extcall IERC20(self.token).transfer(msg.sender, amount)\np: uint256 = staticcall Oracle(self.oracle).price()",
  );

  expect(result).toContain('<span class="hljs-keyword">initializes</span>:');
  expect(result).toContain('<span class="hljs-keyword">uses</span>:');
  expect(result).toContain('<span class="hljs-keyword">exports</span>:');
  expect(result).toContain(
    '<span class="hljs-keyword">transient</span>(<span class="hljs-type">bool</span>)',
  );
  expect(result).toContain('<span class="hljs-keyword">extcall</span> IERC20(');
  expect(result).toContain(
    '<span class="hljs-keyword">staticcall</span> Oracle(',
  );
});

test("vyper highlights flag declarations and numeric separators", () => {
  const result = highlight(
    "flag Roles:\n    ADMIN\n    USER\n\nenum Old:\n    A\n\nLIMIT: constant(uint256) = 1_000_000\nMASK: constant(uint256) = 0xff_ff\nplain: uint256 = 42",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">flag</span> <span class="hljs-title class_">Roles</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">enum</span> <span class="hljs-title class_">Old</span>',
  );
  expect(result).toContain('<span class="hljs-number">1_000_000</span>');
  expect(result).toContain('<span class="hljs-number">0xff_ff</span>');
  expect(result).toContain('<span class="hljs-number">42</span>');
});

test("vyper highlights core builtin functions", () => {
  const result = highlight(
    'assert msg.value >= as_wei_value(1, "ether")\nm: uint256 = max_value(uint256)\ny: uint8 = convert(x, uint8)\nraw_call(self.owner, b"", value=0)\nself.total_supply = 0',
  );

  expect(result).toContain('<span class="hljs-built_in">as_wei_value</span>(');
  expect(result).toContain('<span class="hljs-built_in">max_value</span>(');
  expect(result).toContain('<span class="hljs-built_in">convert</span>(');
  expect(result).toContain('<span class="hljs-built_in">raw_call</span>(');
  // A user field that merely resembles a builtin name is left alone.
  expect(result).toContain(
    '<span class="hljs-literal">self</span>.total_supply = ',
  );
});
