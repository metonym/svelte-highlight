import hljs from "highlight.js/lib/core";
import cppRegister from "highlight.js/lib/languages/cpp";
import metalSource from "../scripts/custom-languages/metal.js";
import { createRegistry } from "../src/engine.js";

import metal from "../src/languages/metal";

hljs.registerLanguage("cpp", cppRegister);

const registry = createRegistry();

registry.register(metal.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "metal" }).value;

test("metal highlights function qualifiers", () => {
  const result = highlight(
    "kernel void add(uint i) {}\nvertex float4 vert(uint v) {}\nfragment half4 frag(float4 p) {}",
  );

  expect(result).toContain('<span class="hljs-keyword">kernel</span>');
  expect(result).toContain('<span class="hljs-keyword">vertex</span>');
  expect(result).toContain('<span class="hljs-keyword">fragment</span>');
  expect(result).toContain('<span class="hljs-title">add</span>');
});

test("metal highlights address spaces", () => {
  const result = highlight(
    "kernel void f(device float* a, constant float& k, threadgroup float* t) {\n    thread float x = 0;\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">device</span>');
  expect(result).toContain('<span class="hljs-keyword">constant</span>');
  expect(result).toContain('<span class="hljs-keyword">threadgroup</span>');
  expect(result).toContain('<span class="hljs-keyword">thread</span>');
});

test("metal highlights attributes in params and struct fields", () => {
  const result = highlight(
    "struct V {\n    float4 position [[position]];\n};\nkernel void f(device float* a [[buffer(0)]], uint2 gid [[thread_position_in_grid]]) {}",
  );

  expect(result).toContain('<span class="hljs-meta">[[position]]</span>');
  expect(result).toContain(
    '<span class="hljs-meta">[[buffer(<span class="hljs-number">0</span>)]]</span>',
  );
  expect(result).toContain(
    '<span class="hljs-meta">[[thread_position_in_grid]]</span>',
  );
});

test("metal highlights vector, matrix, and texture types", () => {
  const result = highlight(
    "fragment half4 f(texture2d<float, access::sample> tex, sampler s, float4x4 m, packed_float3 p, uint2 g) {}",
  );

  expect(result).toContain('<span class="hljs-type">half4</span>');
  expect(result).toContain('<span class="hljs-type">texture2d</span>');
  expect(result).toContain('<span class="hljs-type">sampler</span>');
  expect(result).toContain('<span class="hljs-type">float4x4</span>');
  expect(result).toContain('<span class="hljs-type">packed_float3</span>');
  expect(result).toContain('<span class="hljs-type">uint2</span>');
});

test("metal highlights half literals", () => {
  const result = highlight("half x = 0.5h + .25H + 2h;");

  expect(result).toContain('<span class="hljs-number">0.5h</span>');
  expect(result).toContain('<span class="hljs-number">.25H</span>');
  expect(result).toContain('<span class="hljs-number">2h</span>');
});

test("metal leaves the stock C++ grammar unchanged", () => {
  const code =
    "void run(Device device, int kernel) {\n  std::thread vertex(work, 0.5);\n  thread_local int x = kernel;\n  auto v = a[b[0]];\n}";
  const before = hljs.highlight(code, { language: "cpp" }).value;
  hljs.registerLanguage("metal", metalSource.register);
  const after = hljs.highlight(code, { language: "cpp" }).value;

  expect(after).toBe(before);
  expect(after).not.toContain('keyword">device<');
  expect(after).not.toContain('keyword">vertex<');
  expect(after).not.toContain('keyword">kernel<');
  expect(after).not.toContain('keyword">thread<');
});
