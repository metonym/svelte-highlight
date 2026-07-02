import hljs from "highlight.js/lib/core";
import cairo from "../src/languages/cairo";

hljs.registerLanguage(cairo.name, cairo.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "cairo" }).value;

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
