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

test("gdshader highlights struct declarations", () => {
  const result = highlight("struct Light { vec3 dir; float energy; };");

  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-type">vec3</span>');
});

test("gdshader keeps uint and float suffixes on hex and leading-dot literals", () => {
  const result = highlight(
    "const uint MASK = 0xFFu;\nconst float HALF = .5f;\nuint n = 3u;",
  );

  expect(result).toContain('<span class="hljs-number">0xFFu</span>');
  expect(result).toContain('<span class="hljs-number">.5f</span>');
  expect(result).toContain('<span class="hljs-number">3u</span>');
  expect(result).not.toContain('<span class="hljs-number">0xFF</span>u');
});

test("gdshader highlights Godot 4 spatial, particle and canvas built-ins", () => {
  const result = highlight(
    "POINT_SIZE = 4.0;\nALPHA_SCISSOR_THRESHOLD = 0.5;\nVELOCITY += vec3(0.0) * DELTA;\nCUSTOM.xyz = vec3(1.0);\nvec4 c = INV_PROJECTION_MATRIX * vec4(1.0);\nvec2 p = (CANVAS_MATRIX * vec4(VERTEX, 0.0, 1.0)).xy;",
  );

  expect(result).toContain(
    '<span class="hljs-variable language_">POINT_SIZE</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">ALPHA_SCISSOR_THRESHOLD</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">VELOCITY</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">DELTA</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">CUSTOM</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">INV_PROJECTION_MATRIX</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">CANVAS_MATRIX</span>',
  );
});

test("gdshader leaves generic ALL_CAPS user constants unstyled", () => {
  const result = highlight("const int SIZE = 4;\nconst int NUMBER = 2;");

  expect(result).not.toContain('<span class="hljs-variable language_">');
});

test("gdshader highlights filter, repeat and hint_enum uniform hints", () => {
  const result = highlight(
    'uniform sampler2D tex : filter_nearest, repeat_disable;\nuniform int mode : hint_enum("Fast", "Slow") = 0;\nuniform sampler2D r : hint_roughness_r;',
  );

  expect(result).toContain('<span class="hljs-meta">filter_nearest</span>');
  expect(result).toContain('<span class="hljs-meta">repeat_disable</span>');
  expect(result).toContain('<span class="hljs-meta">hint_enum</span>');
  expect(result).toContain('<span class="hljs-meta">hint_roughness_r</span>');
});
