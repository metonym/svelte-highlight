import { createRegistry } from "../src/engine.js";

import wgsl from "../src/languages/wgsl";

const registry = createRegistry();

registry.register(wgsl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "wgsl" }).value;

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

test("wgsl highlights unsigned integer number suffixes", () => {
  const result = highlight("let x = 42u;\nlet y = 0u;");

  expect(result).toContain('<span class="hljs-number">42u</span>');
  expect(result).toContain('<span class="hljs-number">0u</span>');
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

test("wgsl highlights short vector type aliases", () => {
  const result = highlight("var color: vec4f;");

  expect(result).toContain('<span class="hljs-type">vec4f</span>');
});

test("wgsl highlights builtin texture function calls", () => {
  const result = highlight("let s = textureSample(t, samp, uv);");

  expect(result).toContain('<span class="hljs-built_in">textureSample</span>');
});

test("wgsl highlights address-space and access-mode keywords inside ptr<...>", () => {
  const result = highlight("fn f(p: ptr<storage, f32, read_write>)");

  expect(result).toContain('<span class="hljs-keyword">storage</span>');
  expect(result).toContain('<span class="hljs-keyword">read_write</span>');
});

test("wgsl highlights newer subgroup builtin values", () => {
  const result = highlight("@builtin(subgroup_invocation_id) id: u32");

  expect(result).toContain(
    '<span class="hljs-built_in">subgroup_invocation_id</span>',
  );
});

test("wgsl does not highlight identifiers named after builtin functions unless called", () => {
  const result = highlight("let select = 1;");

  expect(result).not.toContain('<span class="hljs-built_in">select</span>');
});

test("wgsl highlights a realistic compute shader with modern builtins", () => {
  const code = `
@group(0) @binding(0) var t: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let uv: vec2f = vec2f(0.5, 0.5);
  let color: vec4f = textureSample(t, samp, uv);
  let d = dpdx(color.x);
  workgroupBarrier();
}
`;
  const result = highlight(code);

  expect(result).toContain('<span class="hljs-type">vec2f</span>');
  expect(result).toContain('<span class="hljs-type">vec3u</span>');
  expect(result).toContain('<span class="hljs-type">vec4f</span>');
  expect(result).toContain('<span class="hljs-built_in">textureSample</span>');
  expect(result).toContain('<span class="hljs-built_in">dpdx</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">workgroupBarrier</span>',
  );
});
