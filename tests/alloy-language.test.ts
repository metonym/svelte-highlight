import { createRegistry } from "../src/engine.js";

import alloy from "../src/languages/alloy";

const registry = createRegistry();

registry.register(alloy.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "alloy" }).value;

test("alloy highlights a sig header as title.class", () => {
  const result = highlight("sig Person {}");

  expect(result).toContain('<span class="hljs-keyword">sig</span>');
  expect(result).toContain('<span class="hljs-title class_">Person</span>');
});

test("alloy highlights an abstract sig with extends", () => {
  const result = highlight(
    "abstract sig Person {}\nsig Student extends Person {}",
  );

  expect(result).toContain('<span class="hljs-keyword">abstract</span>');
  expect(result).toContain('<span class="hljs-title class_">Student</span>');
  expect(result).toContain('<span class="hljs-keyword">extends</span>');
});

test("alloy highlights pred and assert headers as title.function", () => {
  const result = highlight(
    "pred hasFriend[p: Person] { some p }\nassert NoSelfFriend { all p: Person | p not in p.friends }",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">hasFriend</span>',
  );
  expect(result).toContain(
    '<span class="hljs-title function_">NoSelfFriend</span>',
  );
});

test("alloy highlights -- line comments", () => {
  const result = highlight("-- a comment\nsig Foo {}");

  expect(result).toContain('<span class="hljs-comment">-- a comment</span>');
});

test("alloy highlights operators, longest match first", () => {
  const result = highlight("pred p { A <=> B }\nfact f { r1 <: r2 }");

  expect(result).toContain('<span class="hljs-operator">&lt;=&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">&lt;:</span>');
});

test("alloy does not misclassify shared keywords module/open/abstract/in", () => {
  const result = highlight("module m\nopen util/ordering\nsig A in B {}");

  expect(result).toContain('<span class="hljs-keyword">module</span>');
  expect(result).toContain('<span class="hljs-keyword">open</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
});
