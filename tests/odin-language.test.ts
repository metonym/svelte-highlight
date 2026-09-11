import { createRegistry } from "../src/engine.js";

import odin from "../src/languages/odin";

const registry = createRegistry();

registry.register(odin.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "odin" }).value;

test("odin highlights proc keyword", () => {
  const result = highlight("main :: proc() {}");

  expect(result).toContain('<span class="hljs-keyword">proc</span>');
});

test("odin highlights package and import keywords", () => {
  const result = highlight('package main\nimport "core:fmt"');

  expect(result).toContain('<span class="hljs-keyword">package</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
});

test("odin highlights builtin types", () => {
  const result = highlight("x: int = 5");

  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("odin highlights directives as meta", () => {
  const result = highlight("#partial switch x {}");

  expect(result).toContain('<span class="hljs-meta">#partial</span>');
});

test("odin highlights when and else when keywords", () => {
  const result = highlight(
    "when ODIN_OS == .Windows {\n    foo()\n} else when ODIN_OS == .Darwin {\n    bar()\n}",
  );

  const whenMatches = result.match(/<span class="hljs-keyword">when<\/span>/g);
  expect(whenMatches).toHaveLength(2);
  expect(result).toContain('<span class="hljs-keyword">else</span>');
});

test("odin styles procedure declaration names", () => {
  const result = highlight(
    "main :: proc() {}\nfast :: #force_inline proc(x: int) -> int { return x }\nCallback :: #type proc(x: int) -> bool\nVec2 :: struct { x, y: f32 }",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">main</span> :: <span class="hljs-keyword">proc</span>()',
  );
  expect(result).toContain(
    '<span class="hljs-title function_">fast</span> :: <span class="hljs-meta">#force_inline</span> <span class="hljs-keyword">proc</span>',
  );
  // A `#type proc` alias and a struct are types, not procedure names.
  expect(result).toContain('<span class="hljs-type">Callback</span> :: ');
  expect(result).toContain(
    '<span class="hljs-type">Vec2</span> :: <span class="hljs-keyword">struct</span>',
  );
});

test("odin highlights parenthesized attributes to their closing paren", () => {
  const result = highlight(
    '@(private = "file")\nhelper :: proc() {}\n@(export)\nmain :: proc() {}\n@static counter: int',
  );

  expect(result).toContain(
    '<span class="hljs-meta">@(private = &quot;file&quot;)</span>',
  );
  expect(result).toContain('<span class="hljs-meta">@(export)</span>');
  expect(result).toContain('<span class="hljs-meta">@static</span>');
});

test("odin highlights built-in procedures, the uninitialized literal, and dozenal numbers", () => {
  const result = highlight(
    "u: int = ---\nn := len(arr) + size_of(Vec2)\nappend(&arr, 1)\ndelete(arr)\nd := 0z12\nx := a - b",
  );

  expect(result).toContain('= <span class="hljs-literal">---</span>');
  expect(result).toContain('<span class="hljs-built_in">len</span>(arr)');
  expect(result).toContain('<span class="hljs-built_in">size_of</span>(');
  expect(result).toContain('<span class="hljs-built_in">append</span>(');
  expect(result).toContain('<span class="hljs-built_in">delete</span>(');
  expect(result).toContain('<span class="hljs-number">0z12</span>');
  expect(result).toContain("x := a - b");
});
