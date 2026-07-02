import hljs from "highlight.js/lib/core";
import wgsl from "../src/languages/wgsl";

hljs.registerLanguage(wgsl.name, wgsl.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "wgsl" }).value;

test("wgsl highlights fn declarations and keywords", () => {
  const result = highlight("fn main() { return; }");

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-title function_">main</span>');
  expect(result).toContain('<span class="hljs-keyword">return</span>');
});

test("wgsl highlights builtin types", () => {
  const result = highlight("var color: vec4<f32>;");

  expect(result).toContain('<span class="hljs-type">vec4</span>');
  expect(result).toContain('<span class="hljs-type">f32</span>');
});

test("wgsl highlights attributes as meta", () => {
  const result = highlight("@vertex fn vs() {}");

  expect(result).toContain('<span class="hljs-meta">@vertex</span>');
});

test("wgsl highlights numbers", () => {
  const result = highlight("let x = 1.0;");

  expect(result).toContain('<span class="hljs-number">1.0</span>');
});

test("wgsl highlights address-space and access-mode keywords in var<...>", () => {
  const result = highlight("var<storage, read_write> buf: array<f32>;");

  expect(result).toContain('<span class="hljs-keyword">var</span>');
  expect(result).toContain('<span class="hljs-keyword">storage</span>');
  expect(result).toContain('<span class="hljs-keyword">read_write</span>');
});

test("wgsl highlights builtin stage-IO identifiers", () => {
  const result = highlight("@builtin(vertex_index) idx: u32");

  expect(result).toContain('<span class="hljs-built_in">vertex_index</span>');
});
