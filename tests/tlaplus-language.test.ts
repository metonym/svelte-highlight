import { createRegistry } from "../src/engine.js";

import tlaplus from "../src/languages/tlaplus";

const registry = createRegistry();

registry.register(tlaplus.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "tlaplus" }).value;

test("tlaplus highlights the MODULE banner with the name as title.class", () => {
  const result = highlight("---- MODULE Counter ----");

  expect(result).toContain('<span class="hljs-keyword">MODULE</span>');
  expect(result).toContain('<span class="hljs-title class_">Counter</span>');
});

test("tlaplus highlights EXTENDS/VARIABLE/THEOREM keywords", () => {
  const result = highlight(
    "EXTENDS Naturals\nVARIABLE count\nTHEOREM Spec => TRUE",
  );

  expect(result).toContain('<span class="hljs-keyword">EXTENDS</span>');
  expect(result).toContain('<span class="hljs-keyword">VARIABLE</span>');
  expect(result).toContain('<span class="hljs-keyword">THEOREM</span>');
});

test("tlaplus distinguishes == (definition) from = (equality)", () => {
  const result = highlight("Init == count = 0");

  expect(result).toContain('<span class="hljs-operator">==</span>');
  expect(result).toContain('<span class="hljs-operator">=</span>');
  expect(result).not.toContain(
    '<span class="hljs-operator">=</span><span class="hljs-operator">=</span>',
  );
});

test("tlaplus highlights nested (* *) comments", () => {
  const result = highlight("(* outer (* inner *) still outer *)");

  expect(result).toBe(
    '<span class="hljs-comment">(* outer <span class="hljs-comment">(* inner *)</span> still outer *)</span>',
  );
});

test("tlaplus highlights \\* line comments and \\in/logical operators", () => {
  const result = highlight("\\* a comment\nSpec == Init /\\ x \\in Nat");

  expect(result).toContain('<span class="hljs-comment">\\* a comment</span>');
  expect(result).toContain('<span class="hljs-operator">/\\</span>');
  expect(result).toContain('<span class="hljs-operator">\\in</span>');
});

test("tlaplus is case-sensitive: lowercase words are not misclassified as keywords", () => {
  const result = highlight("the network in a set of nodes");

  expect(result).not.toContain("hljs-keyword");
});
