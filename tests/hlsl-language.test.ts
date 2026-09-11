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

test("hlsl does not mistake a ternary's colon for a semantic", () => {
  const result = highlight(
    "result = useAlpha ? colorWithAlpha : colorWithoutAlpha;",
  );

  expect(result).not.toContain('<span class="hljs-attr">');
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

test("hlsl highlights parameterless attributes like [unroll] and [loop]", () => {
  const result = highlight("[unroll]\nfor (int i = 0; i < 4; i++) {}");

  expect(result).toContain('<span class="hljs-meta">[unroll]</span>');

  const loopResult = highlight("[loop]\nwhile (x > 0) {}");
  expect(loopResult).toContain('<span class="hljs-meta">[loop]</span>');
});

test("hlsl does not mistake array indexing for an attribute", () => {
  const result = highlight("arr[i]");

  expect(result).not.toContain('<span class="hljs-meta">');
});

test("hlsl highlights mixed-case system-value semantics as one span", () => {
  const result = highlight(
    "void CSMain(uint3 tid : SV_DispatchThreadID, uint id : SV_VertexID)",
  );

  expect(result).toContain(
    '<span class="hljs-attr">SV_DispatchThreadID</span>',
  );
  expect(result).toContain('<span class="hljs-attr">SV_VertexID</span>');
  expect(result).not.toContain('<span class="hljs-attr">SV_D</span>');
});

test("hlsl does not treat a mixed-case base class as a semantic", () => {
  const result = highlight("class Lambert : IShade { };");

  expect(result).not.toContain('<span class="hljs-attr">');
  expect(result).toContain('<span class="hljs-keyword">class</span>');
});

test("hlsl highlights long integer suffixes", () => {
  const result = highlight(
    "int64_t a = 0x1FFFll; uint64_t b = 12ull; int c = 3l;",
  );

  expect(result).toContain('<span class="hljs-type">int64_t</span>');
  expect(result).toContain('<span class="hljs-number">0x1FFFll</span>');
  expect(result).toContain('<span class="hljs-number">12ull</span>');
  expect(result).toContain('<span class="hljs-number">3l</span>');
});

test("hlsl highlights storage and interpolation modifiers", () => {
  const result = highlight(
    "groupshared uint hist[256];\nprecise float p = 1.0;\nnointerpolation uint id : ID;\nsnorm float s;",
  );

  expect(result).toContain('<span class="hljs-keyword">groupshared</span>');
  expect(result).toContain('<span class="hljs-keyword">precise</span>');
  expect(result).toContain('<span class="hljs-keyword">nointerpolation</span>');
  expect(result).toContain('<span class="hljs-keyword">snorm</span>');
});

test("hlsl highlights HLSL 2021 declarations and sized types", () => {
  const result = highlight(
    "template<typename T> T Square(T x) { return x * x; }\ninterface IShade { };\nenum class Kind : uint { A };\nexport float16_t Half(uint16_t2 v);",
  );

  expect(result).toContain('<span class="hljs-keyword">template</span>');
  expect(result).toContain('<span class="hljs-keyword">typename</span>');
  expect(result).toContain('<span class="hljs-keyword">interface</span>');
  expect(result).toContain('<span class="hljs-keyword">enum</span>');
  expect(result).toContain('<span class="hljs-keyword">export</span>');
  expect(result).toContain('<span class="hljs-type">float16_t</span>');
  expect(result).toContain('<span class="hljs-type">uint16_t2</span>');
});

test("hlsl highlights wave, atomic, barrier and raytracing intrinsics", () => {
  const result = highlight(
    "RaytracingAccelerationStructure scene : register(t2);\nuint s = WaveActiveSum(v);\nInterlockedAdd(buf[0], 1u);\nGroupMemoryBarrierWithGroupSync();\nTraceRay(scene, RAY_FLAG_NONE, 0xFF, 0, 0, 0, ray, payload);",
  );

  expect(result).toContain('<span class="hljs-built_in">WaveActiveSum</span>');
  expect(result).toContain('<span class="hljs-built_in">InterlockedAdd</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">GroupMemoryBarrierWithGroupSync</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">TraceRay</span>');
  expect(result).toContain(
    '<span class="hljs-type">RaytracingAccelerationStructure</span>',
  );
});
