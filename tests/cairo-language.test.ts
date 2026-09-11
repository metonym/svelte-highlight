import { createRegistry } from "../src/engine.js";

import cairo from "../src/languages/cairo";

const registry = createRegistry();

registry.register(cairo.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cairo" }).value;

test("cairo highlights fn declarations", () => {
  const result = highlight("fn main() {}");

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-title function_">main</span>');
});

test("cairo highlights felt252 and integer types", () => {
  const result = highlight("let x: felt252 = 5;");

  expect(result).toContain('<span class="hljs-type">felt252</span>');
});

test("cairo highlights attributes", () => {
  const result = highlight("#[derive(Drop)]\nstruct S {}");

  expect(result).toContain('<span class="hljs-meta">');
});

test("cairo highlights hex numbers", () => {
  const result = highlight("let a = 0x1f;");

  expect(result).toContain('<span class="hljs-number">0x1f</span>');
});

test("cairo highlights panic!/assert!/array! macros as built-ins", () => {
  const result = highlight(
    "panic!(\"oops\");\nassert!(x == 1, 'bad');\nlet a = array![1, 2, 3];",
  );

  expect(result).toContain('<span class="hljs-built_in">panic!</span>');
  expect(result).toContain('<span class="hljs-built_in">assert!</span>');
  expect(result).toContain('<span class="hljs-built_in">array!</span>');
});

test("cairo highlights common Starknet syscalls as built-ins", () => {
  const result = highlight(
    "let caller = get_caller_address();\nlet addr = get_contract_address();\nlet ts = get_block_timestamp();",
  );

  expect(result).toContain(
    '<span class="hljs-built_in">get_caller_address</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">get_contract_address</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">get_block_timestamp</span>',
  );
});

test("cairo highlights felt252 short strings", () => {
  const result = highlight(
    "const SHORT: felt252 = 'hello';\nreturn Result::Err('zero');\nlet b: ByteArray = \"long\";",
  );

  expect(result).toContain(
    '<span class="hljs-string">&#x27;hello&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-string">&#x27;zero&#x27;</span>');
  expect(result).toContain('<span class="hljs-string">&quot;long&quot;</span>');
});

test("cairo highlights corelib inline macros", () => {
  const result = highlight(
    'println!("v = {}", v);\nlet s = format!("{}", x);\nassert_eq!(a, b);\nlet sel = selector!("transfer");\nlet println = 1;',
  );

  expect(result).toContain('<span class="hljs-built_in">println!</span>(');
  expect(result).toContain('<span class="hljs-built_in">format!</span>(');
  expect(result).toContain('<span class="hljs-built_in">assert_eq!</span>(');
  expect(result).toContain('<span class="hljs-built_in">selector!</span>(');
  // Without the bang it is a plain identifier.
  expect(result).toContain('<span class="hljs-keyword">let</span> println = ');
});

test("cairo highlights super and crate path keywords", () => {
  const result = highlight(
    "impl CounterImpl of super::ICounter<ContractState> {}\npub(crate) fn helper() {}",
  );

  expect(result).toContain('<span class="hljs-keyword">super</span>::');
  expect(result).toContain(
    '<span class="hljs-keyword">pub</span>(<span class="hljs-keyword">crate</span>)',
  );
});
