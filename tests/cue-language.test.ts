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
