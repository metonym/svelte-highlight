import { createRegistry } from "../src/engine.js";

import move from "../src/languages/move";

const registry = createRegistry();

registry.register(move.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "move" }).value;

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

test("move highlights test attributes", () => {
  const result = highlight(
    "#[test]\nfun test_mint() {}\n\n#[test_only]\nmodule test_helpers {}\n\n#[expected_failure]\nfun f() {}",
  );

  expect(result).toContain('<span class="hljs-meta">#[test]</span>');
  expect(result).toContain('<span class="hljs-meta">#[test_only]</span>');
  expect(result).toContain(
    '<span class="hljs-meta">#[expected_failure]</span>',
  );
});

test("move highlights module <addr>::<name> path declarations", () => {
  const result = highlight(
    "module 0x42::message {}\nmodule aptos_framework::coin {}",
  );

  expect(result).toContain('<span class="hljs-keyword">module</span>');
  expect(result).toContain('<span class="hljs-title class_">message</span>');
  expect(result).toContain('<span class="hljs-title class_">coin</span>');
});
