import { createRegistry } from "../src/engine.js";

import cue from "../src/languages/cue";

const registry = createRegistry();

registry.register(cue.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cue" }).value;

test("cue highlights package and import keywords", () => {
  const result = highlight("package config");

  expect(result).toContain('<span class="hljs-keyword">package</span>');
});

test("cue highlights definitions", () => {
  const result = highlight("#Schema: {}");

  expect(result).toContain('<span class="hljs-title class_">#Schema</span>');
});

test("cue highlights builtin types", () => {
  const result = highlight("name: string");

  expect(result).toContain('<span class="hljs-type">string</span>');
});

test("cue highlights strings and numbers", () => {
  const result = highlight('host: "localhost"\nport: 8080');

  expect(result).toContain(
    '<span class="hljs-string">&quot;localhost&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">8080</span>');
});

test("cue highlights disjunction, unification, and constraint operators", () => {
  const result = highlight(
    'age: >=0 & <=120\nkind: string | int\nname: =~"^[a-z]+$"\nother: !~"x"\nport: !=80',
  );

  expect(result).toContain('<span class="hljs-operator">&gt;=</span>');
  expect(result).toContain('<span class="hljs-operator">&lt;=</span>');
  expect(result).toContain('<span class="hljs-operator">&amp;</span>');
  expect(result).toContain('<span class="hljs-operator">|</span>');
  expect(result).toContain('<span class="hljs-operator">=~</span>');
  expect(result).toContain('<span class="hljs-operator">!~</span>');
  expect(result).toContain('<span class="hljs-operator">!=</span>');
});

test("cue highlights single-quoted byte-string literals", () => {
  const result = highlight("data: 'byte string'");

  expect(result).toContain(
    '<span class="hljs-string">&#x27;byte string&#x27;</span>',
  );
});

test("cue highlights the optional-field marker", () => {
  const result = highlight("foo?: string");

  expect(result).toContain('<span class="hljs-operator">?</span>');
});

test("cue highlights the required-field marker", () => {
  const result = highlight("name!: string\nnot: !x");

  expect(result).toContain(
    'name<span class="hljs-operator">!</span>: <span class="hljs-type">string</span>',
  );
  expect(result).toContain("not: !x");
});

test("cue highlights bare comparison operators and equality", () => {
  const result = highlight("age: int & >=0 & <150\nok: x == 1 && y > 2");

  expect(result).toContain(
    '<span class="hljs-operator">&lt;</span><span class="hljs-number">150</span>',
  );
  expect(result).toContain('<span class="hljs-operator">&gt;=</span>');
  expect(result).toContain('<span class="hljs-operator">==</span>');
  expect(result).toContain('<span class="hljs-operator">&gt;</span> ');
  expect(result).not.toContain(
    '<span class="hljs-operator">&gt;</span><span class="hljs-operator">=</span>',
  );
});

test("cue highlights word-form arithmetic operators and bottom", () => {
  const result = highlight(
    "a: 10 div 3\nb: 10 mod 3\nc: 7 quo 2\nd: 7 rem 2\ne: _|_",
  );

  expect(result).toContain('<span class="hljs-keyword">div</span>');
  expect(result).toContain('<span class="hljs-keyword">mod</span>');
  expect(result).toContain('<span class="hljs-keyword">quo</span>');
  expect(result).toContain('<span class="hljs-keyword">rem</span>');
  expect(result).toContain('<span class="hljs-literal">_|_</span>');
  expect(result).not.toContain('_<span class="hljs-operator">|</span>_');
});
