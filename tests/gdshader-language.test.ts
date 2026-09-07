import { createRegistry } from "../src/engine.js";

import gdshader from "../src/languages/gdshader";

const registry = createRegistry();

registry.register(gdshader.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "gdshader" }).value;

test("gdshader highlights shader_type/render_mode with high relevance", () => {
  const result = highlight("shader_type spatial;");

  expect(result).toContain(
    '<span class="hljs-meta">shader_type spatial;</span>',
  );
});

test("gdshader highlights entry-point functions", () => {
  const result = highlight("void vertex() {}");

  expect(result).toContain('<span class="hljs-title function_">vertex</span>');
});

test("gdshader highlights hints as meta", () => {
  const result = highlight("uniform float x : hint_range(0, 1);");

  expect(result).toContain('<span class="hljs-meta">hint_range</span>');
});

test("gdshader highlights built-in Godot variables", () => {
  const result = highlight("VERTEX.y += sin(TIME);");

  expect(result).toContain(
    '<span class="hljs-variable language_">VERTEX</span>',
  );
  expect(result).toContain('<span class="hljs-variable language_">TIME</span>');
});

test("gdshader highlights swizzles as properties", () => {
  const result = highlight("ALBEDO.rgb");

  expect(result).toContain('<span class="hljs-property">.rgb</span>');
});

test("gdshader highlights GLSL types and functions", () => {
  const result = highlight("vec3 color = mix(a, b, 0.5);");

  expect(result).toContain('<span class="hljs-type">vec3</span>');
  expect(result).toContain('<span class="hljs-built_in">mix</span>');
});
