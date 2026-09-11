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

test("typespec highlights const and typeof", () => {
  const result = highlight(
    'const cfg = #{ enabled: true };\nmodel X { note: typeof "hello"; }',
  );

  expect(result).toContain('<span class="hljs-keyword">const</span> cfg');
  expect(result).toContain(
    '<span class="hljs-keyword">typeof</span> <span class="hljs-string">&quot;hello&quot;</span>',
  );
});

test("typespec highlights augment decorators as one token", () => {
  const result = highlight('@@doc(Pet.name, "The name");\n@doc("x")');

  expect(result).toContain('<span class="hljs-meta">@@doc</span>(Pet.name');
  expect(result).toContain('<span class="hljs-meta">@doc</span>(');
  expect(result).not.toContain('@<span class="hljs-meta">@doc</span>');
});

test("typespec highlights binary and hex literals and newer scalars", () => {
  const result = highlight(
    "model N { bits: 0b1010; mask: 0xFF; price: decimal128; n: safeint; t: unixTimestamp32; }",
  );

  expect(result).toContain('<span class="hljs-number">0b1010</span>');
  expect(result).toContain('<span class="hljs-number">0xFF</span>');
  expect(result).toContain('<span class="hljs-type">decimal128</span>');
  expect(result).toContain('<span class="hljs-type">safeint</span>');
  expect(result).toContain('<span class="hljs-type">unixTimestamp32</span>');
});

test("typespec no longer styles projection as a keyword", () => {
  const result = highlight("model M { projection: string; }");

  expect(result).not.toContain('hljs-keyword">projection');
  expect(result).toContain('projection: <span class="hljs-type">string</span>');
});
