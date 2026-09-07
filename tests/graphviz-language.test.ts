import { createRegistry } from "../src/engine.js";

import graphviz from "../src/languages/graphviz";

const registry = createRegistry();

registry.register(graphviz.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "graphviz" }).value;

test("graphviz highlights digraph with high relevance", () => {
  const result = highlight("digraph pipeline {}");

  expect(result).toContain('<span class="hljs-keyword">digraph</span>');
});

test("graphviz highlights edge operators", () => {
  const result = highlight("compile -> test;");

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("graphviz highlights known attribute names as built-ins", () => {
  const result = highlight("node [shape=box, color=red];");

  expect(result).toContain('<span class="hljs-built_in">shape</span>');
});

test("graphviz highlights subgraph names as title.class", () => {
  const result = highlight("subgraph cluster_build {}");

  expect(result).toContain(
    '<span class="hljs-title class_">cluster_build</span>',
  );
});

test("graphviz highlights port suffixes as symbols", () => {
  const result = highlight("deploy:n -> prod;");

  expect(result).toContain('<span class="hljs-symbol">:n</span>');
});

test("graphviz highlights strings and comments", () => {
  const result = highlight('// a comment\nlabel="on success";');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;on success&quot;</span>',
  );
});
