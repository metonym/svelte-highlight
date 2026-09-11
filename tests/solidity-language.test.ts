import { createRegistry } from "../src/engine.js";

import solidity from "../src/languages/solidity";

const registry = createRegistry();

registry.register(solidity.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "solidity" }).value;

test("solidity highlights pragma and contract keywords", () => {
  const result = highlight("pragma solidity ^0.8.24;\ncontract Token {}");

  expect(result).toContain('<span class="hljs-keyword">pragma</span>');
  expect(result).toContain('<span class="hljs-keyword">contract</span>');
});

test("solidity highlights an inheritance list without tagging 'is' as a title", () => {
  const result = highlight("contract Foo is Ownable, ReentrancyGuard {\n}");

  expect(result).toContain('<span class="hljs-title">Foo</span>');
  expect(result).toContain('<span class="hljs-keyword">is</span>');
  expect(result).toContain('<span class="hljs-title class_">Ownable</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">ReentrancyGuard</span>',
  );
  expect(result).not.toContain('<span class="hljs-title">is</span>');
});

test("solidity highlights hex literals with underscore digit separators", () => {
  const result = highlight("uint256 x = 0x1234_5678;");

  expect(result).toContain('<span class="hljs-number">0x1234_5678</span>');
});

test("solidity highlights elementary value types", () => {
  const result = highlight(
    "mapping(address => uint256) balances;\nbytes32 salt;\nuint8 decimals;",
  );

  expect(result).toContain('<span class="hljs-type">address</span>');
  expect(result).toContain('<span class="hljs-type">uint256</span>');
  expect(result).toContain('<span class="hljs-type">bytes32</span>');
  expect(result).toContain('<span class="hljs-type">uint8</span>');
});

test("solidity highlights NatSpec doc tags inside doc comments", () => {
  const result = highlight(
    "/// @notice transfers tokens\n/// @param to recipient",
  );

  expect(result).toContain("hljs-comment");
  expect(result).toContain('<span class="hljs-doctag">@notice</span>');
  expect(result).toContain('<span class="hljs-doctag">@param</span>');
});

test("solidity highlights ether units as literals", () => {
  const result = highlight("uint256 fee = 1 ether;\nuint256 d = 30 days;");

  expect(result).toContain('<span class="hljs-literal">ether</span>');
  expect(result).toContain('<span class="hljs-literal">days</span>');
});

test("solidity highlights built-in globals", () => {
  const result = highlight("require(msg.sender == owner);");

  expect(result).toContain('<span class="hljs-built_in">require</span>');
  expect(result).toContain('<span class="hljs-built_in">msg</span>');
});

test("solidity highlights the mulmod builtin", () => {
  const result = highlight("mulmod(a, b, m);");

  expect(result).toContain('<span class="hljs-built_in">mulmod</span>');
});

test("solidity scopes constructor/fallback/receive with the same declaration construct as function", () => {
  // constructor/fallback/receive now join the "function modifier event error"
  // beginKeywords list, so they're parsed by the same title-highlighting construct
  // as regular function/modifier/event declarations rather than falling through to
  // plain keyword matching.
  const result = highlight(
    "constructor(address owner) {}\nfallback() external payable {}\nreceive() external payable {}",
  );

  expect(result).toContain('<span class="hljs-keyword">constructor</span>');
  expect(result).toContain('<span class="hljs-keyword">fallback</span>');
  expect(result).toContain('<span class="hljs-keyword">receive</span>');
});

test("solidity highlights transient and global as keywords", () => {
  const result = highlight(
    "using SafeMath for uint256 global;\nuint256 transient lock;",
  );

  expect(result).toContain('<span class="hljs-keyword">global</span>');
  expect(result).toContain('<span class="hljs-keyword">transient</span>');
});

test("solidity highlights Yul keywords and opcodes inside assembly blocks", () => {
  const result = highlight(
    "assembly {\n  let x := mload(0x40)\n  mstore(x, 1)\n  if iszero(x) { revert(0, 0) }\n}\nuint256 y;",
  );

  expect(result).toContain('<span class="hljs-keyword">assembly</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">let</span> x := <span class="hljs-built_in">mload</span>(<span class="hljs-number">0x40</span>)',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">if</span> <span class="hljs-built_in">iszero</span>(x) { <span class="hljs-built_in">revert</span>(',
  );
  // The block closed at its own `}`: the Solidity declaration after it is
  // parsed with the Solidity table again.
  expect(result).toContain('<span class="hljs-type">uint256</span> y;');
});

test("solidity balances nested braces inside assembly blocks", () => {
  const result = highlight(
    'assembly ("memory-safe") {\n  switch x\n  case 0 { y := 1 }\n  default { y := 2 }\n  for { let i := 0 } lt(i, 3) { i := add(i, 1) } { }\n}\nfunction f() public {}',
  );

  expect(result).toContain(
    '<span class="hljs-string">(&quot;memory-safe&quot;) </span>',
  );
  expect(result).toContain('<span class="hljs-keyword">switch</span> x');
  expect(result).toContain(
    '<span class="hljs-keyword">case</span> <span class="hljs-number">0</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">for</span> { <span class="hljs-keyword">let</span> i',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">function</span> <span class="hljs-title function_">f</span>',
  );
});

test("solidity keeps Yul opcode names as plain identifiers outside assembly", () => {
  const result = highlight("uint256 number = 1;\naddress caller = msg.sender;");

  expect(result).not.toContain('hljs-built_in">number');
  expect(result).not.toContain('hljs-built_in">caller');
});
