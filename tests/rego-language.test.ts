import { createRegistry } from "../src/engine.js";

import rego from "../src/languages/rego";

const registry = createRegistry();

registry.register(rego.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "rego" }).value;

test("rego highlights package and import declarations", () => {
  const result = highlight("package authz\n\nimport future.keywords.if");

  expect(result).toContain('<span class="hljs-keyword">package</span>');
  expect(result).toContain('<span class="hljs-title class_">authz</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
});

test("rego highlights default and if keywords in rule definitions", () => {
  const result = highlight(
    'default allow = false\n\nallow if {\n  input.method == "GET"\n}',
  );

  expect(result).toContain('<span class="hljs-keyword">default</span>');
  expect(result).toContain('<span class="hljs-title function_">allow</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
});

test("rego highlights partial-set rule heads with contains", () => {
  const result = highlight('deny contains msg if {\n  msg := "not allowed"\n}');

  expect(result).toContain('<span class="hljs-title function_">deny</span>');
  expect(result).toContain('<span class="hljs-keyword">contains</span>');
  expect(result).toContain('<span class="hljs-variable">msg</span>');
});

test("rego highlights the input and data built-ins", () => {
  const result = highlight("x := input.foo\ny := data.bar");

  expect(result).toContain('<span class="hljs-built_in">input</span>');
  expect(result).toContain('<span class="hljs-built_in">data</span>');
});

test("rego highlights built-in function calls", () => {
  const result = highlight('sprintf("hello %s", [name])');

  expect(result).toContain('<span class="hljs-built_in">sprintf</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;hello %s&quot;</span>',
  );
});

test("rego highlights dotted built-ins like object.get and json.marshal", () => {
  const result = highlight('object.get(input, "user", "anonymous")');

  expect(result).toContain('<span class="hljs-built_in">object.get</span>');
});

test("rego recognizes function-style rule heads, not just partial sets", () => {
  const result = highlight("is_valid_user(u) {\n  u.age > 18\n}");

  expect(result).toContain(
    '<span class="hljs-title function_">is_valid_user</span>',
  );
});

test("rego does not tag user-defined function calls as built-ins", () => {
  const result = highlight(
    "is_valid_user(u) {\n  u.age > 18\n}\n\nallow {\n  is_valid_user(input.user)\n}",
  );

  expect(result).not.toContain(
    '<span class="hljs-built_in">is_valid_user</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">input</span>');
});

test("rego highlights strings and numbers", () => {
  const result = highlight('numbers := [1, 2, 3.5, -4]\nname := "OPA"');

  expect(result).toContain('<span class="hljs-number">1</span>');
  expect(result).toContain('<span class="hljs-number">3.5</span>');
  expect(result).toContain('<span class="hljs-number">-4</span>');
  expect(result).toContain('<span class="hljs-string">&quot;OPA&quot;</span>');
});

test("rego highlights comments", () => {
  const result = highlight("# this is a comment\nallow = true");

  expect(result).toContain(
    '<span class="hljs-comment"># this is a comment</span>',
  );
  expect(result).toContain('<span class="hljs-literal">true</span>');
});
