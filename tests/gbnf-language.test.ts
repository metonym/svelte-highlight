import { createRegistry } from "../src/engine.js";

import gbnf from "../src/languages/gbnf";

const registry = createRegistry();

registry.register(gbnf.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "gbnf" }).value;

test("gbnf highlights a rule definition with the ::= operator", () => {
  const result = highlight("root ::= object");

  expect(result).toContain('<span class="hljs-title function_">root</span>');
  expect(result).toContain('<span class="hljs-operator">::=</span>');
});

test("gbnf highlights quoted terminals", () => {
  const result = highlight('pair ::= string ":" value');

  expect(result).toContain('<span class="hljs-string">&quot;:&quot;</span>');
});

test("gbnf highlights character classes", () => {
  const result = highlight("number ::= [0-9]+");

  expect(result).toContain('<span class="hljs-regexp">[0-9]</span>');
});

test("gbnf highlights alternation and rule references", () => {
  const result = highlight("value ::= string | number | object");

  expect(result).toContain('<span class="hljs-operator">|</span>');
  expect(result).toContain('<span class="hljs-symbol">string</span>');
});

test("gbnf highlights comments", () => {
  const result = highlight("# a simple grammar\nroot ::= object");

  expect(result).toContain(
    '<span class="hljs-comment"># a simple grammar</span>',
  );
});
