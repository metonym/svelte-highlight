import { createRegistry } from "../src/engine.js";

import hlsl from "../src/languages/hlsl";

const registry = createRegistry();

registry.register(hlsl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "hlsl" }).value;

test("hlsl highlights builtin types", () => {
  const result = highlight("float4 main(float2 uv) {}");

  expect(result).toContain('<span class="hljs-type">float4</span>');
  expect(result).toContain('<span class="hljs-type">float2</span>');
});

test("hlsl highlights semantics after a colon", () => {
  const result = highlight("float4 main(float2 uv : TEXCOORD0) : SV_TARGET {}");

  expect(result).toContain('<span class="hljs-attr">TEXCOORD0</span>');
  expect(result).toContain('<span class="hljs-attr">SV_TARGET</span>');
});

test("hlsl highlights intrinsic functions", () => {
  const result = highlight("return saturate(lerp(a, b, mul(m, v).x));");

  expect(result).toContain('<span class="hljs-built_in">saturate</span>');
  expect(result).toContain('<span class="hljs-built_in">lerp</span>');
  expect(result).toContain('<span class="hljs-built_in">mul</span>');
});

test("hlsl highlights keywords and control flow", () => {
  const result = highlight("if (x > 0) { return; } else { discard; }");

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">return</span>');
  expect(result).toContain('<span class="hljs-keyword">discard</span>');
});

test("hlsl highlights preprocessor directives", () => {
  const result = highlight('#define MAX_LIGHTS 4\n#include "common.hlsli"');

  expect(result).toContain('<span class="hljs-keyword">define</span>');
  expect(result).toContain('<span class="hljs-keyword">include</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;common.hlsli&quot;</span>',
  );
});

test("hlsl highlights line and block comments", () => {
  const result = highlight("// line comment\n/* block comment */");

  expect(result).toContain('<span class="hljs-comment">// line comment</span>');
  expect(result).toContain(
    '<span class="hljs-comment">/* block comment */</span>',
  );
});

test("hlsl highlights numeric literals", () => {
  const result = highlight("float x = 1.0f; int y = 0x1A;");

  expect(result).toContain('<span class="hljs-number">1.0f</span>');
  expect(result).toContain('<span class="hljs-number">0x1A</span>');
});

test("hlsl highlights resource types like Texture2D and SamplerState", () => {
  const result = highlight(
    "Texture2D mainTex : register(t0);\nSamplerState samp : register(s0);",
  );

  expect(result).toContain('<span class="hljs-type">Texture2D</span>');
  expect(result).toContain('<span class="hljs-type">SamplerState</span>');
  expect(result).toContain('<span class="hljs-keyword">register</span>');
});

test("hlsl highlights numthreads attributes", () => {
  const result = highlight("[numthreads(8,8,1)]\nvoid CSMain() {}");

  expect(result).toContain(
    '<span class="hljs-meta">[numthreads(8,8,1)]</span>',
  );
});

test("hlsl does not mistake array indexing for an attribute", () => {
  const result = highlight("arr[i]");

  expect(result).not.toContain('<span class="hljs-meta">');
});
