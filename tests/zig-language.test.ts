import hljs from "highlight.js/lib/core";
import zig from "../src/languages/zig";

hljs.registerLanguage(zig.name, zig.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "zig" }).value;

test("zig highlights keywords", () => {
  const result = highlight("pub fn main() !void {\n  const x = 0;\n}");

  expect(result).toContain('<span class="hljs-keyword">pub</span>');
  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-keyword">const</span>');
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
