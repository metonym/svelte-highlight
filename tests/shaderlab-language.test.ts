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
