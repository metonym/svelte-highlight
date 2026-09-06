import { createRegistry } from "../src/engine.js";

import typespec from "../src/languages/typespec";

const registry = createRegistry();

registry.register(typespec.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "typespec" }).value;

test("typespec highlights decorators", () => {
  const result = highlight('@doc("A simple user model")');

  expect(result).toContain('<span class="hljs-meta">@doc</span>');
});

test("typespec highlights keywords and built-in types", () => {
  const result = highlight("model User {\n  id: string;\n}");

  expect(result).toContain('<span class="hljs-keyword">model</span>');
  expect(result).toContain('<span class="hljs-type">string</span>');
});

test("typespec highlights optional properties", () => {
  const result = highlight("age?: int32;");

  expect(result).toContain('<span class="hljs-operator">?</span>');
  expect(result).toContain('<span class="hljs-type">int32</span>');
});

test("typespec highlights route decorators on operations", () => {
  const result = highlight('@route("/users")\ninterface Users {}');

  expect(result).toContain('<span class="hljs-meta">@route</span>');
  expect(result).toContain('<span class="hljs-keyword">interface</span>');
});

test("typespec highlights comments and strings", () => {
  const result = highlight('// a comment\nimport "@typespec/http";');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;@typespec/http&quot;</span>',
  );
});
