import { createRegistry } from "../src/engine.js";

import shaderlab from "../src/languages/shaderlab";

const registry = createRegistry();

registry.register(shaderlab.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "shaderlab" }).value;

test("shaderlab highlights the Shader header with high relevance", () => {
  const result = highlight('Shader "Custom/Simple" {');

  expect(result).toContain('<span class="hljs-keyword">Shader</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;Custom/Simple&quot;</span>',
  );
});

test("shaderlab highlights block keywords", () => {
  const result = highlight("SubShader {\n  Pass {\n  }\n}");

  expect(result).toContain('<span class="hljs-keyword">SubShader</span>');
  expect(result).toContain('<span class="hljs-keyword">Pass</span>');
});

test("shaderlab highlights property declarations", () => {
  const result = highlight('_MainTex ("Texture", 2D) = "white" {}');

  expect(result).toContain('<span class="hljs-variable">_MainTex</span>');
  expect(result).toContain('<span class="hljs-type">2D</span>');
});

test("shaderlab highlights attributes as meta", () => {
  const result = highlight('[HideInInspector] _Foo ("Foo", Float) = 0');

  expect(result).toContain('<span class="hljs-meta">[HideInInspector]</span>');
});

test("shaderlab embeds CGPROGRAM/ENDCG blocks as HLSL", () => {
  const result = highlight(
    "CGPROGRAM\n#pragma vertex vert\nfloat4 frag() : SV_Target {}\nENDCG",
  );

  expect(result).toContain('<span class="hljs-meta">CGPROGRAM</span>');
  expect(result).toContain('<span class="hljs-meta">ENDCG</span>');
  expect(result).toContain("SV_Target");
});

test("shaderlab highlights blend/comparison literals", () => {
  const result = highlight("Blend SrcAlpha OneMinusSrcAlpha\nZTest LEqual");

  expect(result).toContain('<span class="hljs-literal">SrcAlpha</span>');
  expect(result).toContain('<span class="hljs-literal">LEqual</span>');
});

test("shaderlab highlights blend operations and the remaining blend factors", () => {
  const result = highlight("Blend SrcColor OneMinusDstAlpha\nBlendOp RevSub");

  expect(result).toContain('<span class="hljs-keyword">BlendOp</span>');
  expect(result).toContain('<span class="hljs-literal">RevSub</span>');
  expect(result).toContain('<span class="hljs-literal">SrcColor</span>');
  expect(result).toContain(
    '<span class="hljs-literal">OneMinusDstAlpha</span>',
  );
});

test("shaderlab highlights the full Stencil block vocabulary", () => {
  const result = highlight(
    "Stencil { Ref 1 Comp GEqual Pass Replace Fail Keep ZFail IncrSat ReadMask 255 WriteMask 255 }",
  );

  expect(result).toContain('<span class="hljs-literal">GEqual</span>');
  expect(result).toContain('<span class="hljs-literal">Replace</span>');
  expect(result).toContain('<span class="hljs-keyword">Fail</span>');
  expect(result).toContain('<span class="hljs-literal">Keep</span>');
  expect(result).toContain('<span class="hljs-keyword">ZFail</span>');
  expect(result).toContain('<span class="hljs-literal">IncrSat</span>');
  expect(result).toContain('<span class="hljs-keyword">ReadMask</span>');
  expect(result).toContain('<span class="hljs-keyword">WriteMask</span>');
});

test("shaderlab highlights property references in render-state commands", () => {
  const result = highlight("Cull [_Cull]\nBlend [_SrcBlend] [_DstBlend]");

  expect(result).toContain('[<span class="hljs-variable">_Cull</span>]');
  expect(result).toContain('[<span class="hljs-variable">_SrcBlend</span>]');
  expect(result).not.toContain('<span class="hljs-meta">[_Cull]</span>');
});

test("shaderlab still styles bracketed attributes as meta", () => {
  const result = highlight(
    '[HDR] _Emission ("Emission", Color) = (0, 0, 0, 0)',
  );

  expect(result).toContain('<span class="hljs-meta">[HDR]</span>');
  expect(result).not.toContain('<span class="hljs-variable">HDR</span>');
});

test("shaderlab highlights Conservative, Dependency and PackageRequirements", () => {
  const result = highlight(
    'Conservative True\nDependency "BaseMapShader" = "Hidden/Base"\nPackageRequirements { "com.unity.render-pipelines.universal" }',
  );

  expect(result).toContain('<span class="hljs-literal">True</span>');
  expect(result).toContain('<span class="hljs-keyword">Dependency</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">PackageRequirements</span>',
  );
});
