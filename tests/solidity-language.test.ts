import hljs from "highlight.js/lib/core";
import solidity from "../src/languages/solidity";

hljs.registerLanguage(solidity.name, solidity.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "solidity" }).value;

test("solidity highlights pragma and contract keywords", () => {
  const result = highlight("pragma solidity ^0.8.24;\ncontract Token {}");

  expect(result).toContain('<span class="hljs-keyword">pragma</span>');
  expect(result).toContain('<span class="hljs-keyword">contract</span>');
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
