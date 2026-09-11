import { createRegistry } from "../src/engine.js";

import datalog from "../src/languages/datalog";

const registry = createRegistry();

registry.register(datalog.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "datalog" }).value;

test("datalog highlights Souffle directives as meta", () => {
  const result = highlight(".decl edge(x: symbol, y: symbol)");

  expect(result).toContain('<span class="hljs-meta">.decl</span>');
});

test("datalog highlights the rule operator and predicate names", () => {
  const result = highlight("path(x, y) :- edge(x, y).");

  expect(result).toContain('<span class="hljs-operator">:-</span>');
  expect(result).toContain('<span class="hljs-title function_">path</span>');
});

test("datalog highlights capitalized variables and negation", () => {
  const result = highlight(
    "path(X, Y) :- path(X, Z), edge(Z, Y), !edge(Y, X).",
  );

  expect(result).toContain('<span class="hljs-variable">X</span>');
  expect(result).toContain('<span class="hljs-keyword">!</span>');
});

test("datalog highlights line comments", () => {
  const result = highlight(
    "// transitive closure\n.decl path(x: symbol, y: symbol)",
  );

  expect(result).toContain(
    '<span class="hljs-comment">// transitive closure</span>',
  );
});

test("datalog highlights % comments without styling their words as variables", () => {
  const result = highlight("% Prolog-style comment\npath(X, Y) :- edge(X, Y).");

  expect(result).toContain(
    '<span class="hljs-comment">% Prolog-style comment</span>',
  );
  expect(result).not.toContain('<span class="hljs-variable">Prolog</span>');
  expect(result).toContain('<span class="hljs-variable">X</span>');
});

test("datalog keeps != a comparison while ! stays negation", () => {
  const result = highlight("path(x, z) :- edge(x, y), x != z, !edge(z, x).");

  expect(result).toContain("x != z");
  expect(result).not.toContain('<span class="hljs-keyword">!</span>=');
  expect(result).toContain(
    '<span class="hljs-keyword">!</span><span class="hljs-title function_">edge</span>',
  );
});

test("datalog highlights Souffle aggregates, preprocessor lines, and numeric forms", () => {
  const result = highlight(
    '#include "common.dl"\ndegree(x, n) :- node(x), n = count : { edge(x, _) }, n >= 0x1F, n < 1e3, b = 0b101.',
  );

  expect(result).toContain('<span class="hljs-meta">#include</span>');
  expect(result).toContain('<span class="hljs-built_in">count</span> :');
  expect(result).toContain('<span class="hljs-number">0x1F</span>');
  expect(result).toContain('<span class="hljs-number">1e3</span>');
  expect(result).toContain('<span class="hljs-number">0b101</span>');
  // A relation named `count` is still a predicate, not an aggregate.
  expect(highlight("count(x, n) :- node(x).")).toContain(
    '<span class="hljs-title function_">count</span>',
  );
});
