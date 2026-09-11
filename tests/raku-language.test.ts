import { createRegistry } from "../src/engine.js";

import raku from "../src/languages/raku";

const registry = createRegistry();

registry.register(raku.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "raku" }).value;

test("raku highlights sigil variables", () => {
  const result = highlight('my $name = "world";');

  expect(result).toContain('<span class="hljs-keyword">my</span>');
  expect(result).toContain('<span class="hljs-variable">$name</span>');
});

test("raku highlights twigils with elevated relevance", () => {
  const result = highlight("has $.x is rw;");

  expect(result).toContain('<span class="hljs-variable">$.x</span>');
  expect(result).toContain('<span class="hljs-keyword">is</span>');
});

test("raku highlights method/multi/grammar/token as relevance carriers", () => {
  const result = highlight("method foo() { }\nmulti sub bar() { }");

  expect(result).toContain('<span class="hljs-keyword">method</span>');
  expect(result).toContain('<span class="hljs-keyword">multi</span>');
});

test("raku highlights the smartmatch operator", () => {
  const result = highlight("$a ~~ $b");

  expect(result).toContain('<span class="hljs-operator">~~</span>');
});

test("raku highlights declarator docs and pod comments", () => {
  const result = highlight("#| doubles a number\nsub double($x) { }");

  expect(result).toContain(
    '<span class="hljs-comment">#| doubles a number</span>',
  );
});

test("raku balances nested braces inside q{} strings", () => {
  const result = highlight("my $q = q{foo {bar} baz}; say $name;");

  expect(result).toContain('<span class="hljs-string">q{foo {bar} baz}</span>');
  expect(result).toContain('<span class="hljs-keyword">say</span>');
  expect(result).toContain('<span class="hljs-variable">$name</span>');
});

test("raku does not let a nested brace close a q{} string early", () => {
  const result = highlight("my $q = q{a {b} c};\nmy $n = 1;");

  expect(result).toContain('<span class="hljs-variable">$n</span>');
  expect(result).toContain('<span class="hljs-number">1</span>');
  expect(result).not.toContain("c};");
});
