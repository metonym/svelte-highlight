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
