import { createRegistry } from "../src/engine.js";

import zig from "../src/languages/zig";

const registry = createRegistry();

registry.register(zig.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "zig" }).value;

test("zig highlights keywords", () => {
  const result = highlight("pub fn main() !void {\n  const x = 0;\n}");

  expect(result).toContain('<span class="hljs-keyword">pub</span>');
  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-keyword">const</span>');
});

test("zig highlights function names", () => {
  const result = highlight("fn add(a: i32, b: i32) i32 {\n  return a + b;\n}");

  expect(result).toContain('<span class="hljs-title function_">add</span>');
});

test("zig highlights @builtins", () => {
  const result = highlight(`const std = @import("std");`);

  expect(result).toContain('<span class="hljs-built_in">@import</span>');
});

test("zig highlights sized and named types", () => {
  const result = highlight(
    "var x: u32 = 0;\nvar y: f64 = 0;\nvar z: bool = true;",
  );

  expect(result).toContain('<span class="hljs-type">u32</span>');
  expect(result).toContain('<span class="hljs-type">f64</span>');
  expect(result).toContain('<span class="hljs-type">bool</span>');
});

test("zig highlights hex and binary number literals", () => {
  const result = highlight("const mask = 0xFF_00;\nconst flags = 0b1010;");

  expect(result).toContain("hljs-number");
});

test("zig highlights literals", () => {
  const result = highlight(
    "const a = true;\nconst b = null;\nconst c = undefined;",
  );

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
  expect(result).toContain('<span class="hljs-literal">undefined</span>');
});

test("zig highlights the anyopaque type", () => {
  const result = highlight("fn f(p: *anyopaque) void {}");

  expect(result).toContain('<span class="hljs-type">anyopaque</span>');
});

test("zig highlights optional and error-union type modifiers", () => {
  const result = highlight(
    "fn foo() ?u32 {\n  return null;\n}\nfn bar() anyerror!void {\n  return;\n}",
  );

  expect(result).toContain('<span class="hljs-type">?</span>');
  expect(result).toContain('<span class="hljs-type">!</span>');
});
