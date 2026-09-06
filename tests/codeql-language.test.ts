import { createRegistry } from "../src/engine.js";

import codeql from "../src/languages/codeql";

const registry = createRegistry();

registry.register(codeql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "codeql" }).value;

test("codeql highlights select/from/predicate as relevance carriers", () => {
  const result = highlight("from Variable v\nwhere v.getName() = 1\nselect v");

  expect(result).toContain('<span class="hljs-keyword">from</span>');
  expect(result).toContain('<span class="hljs-keyword">select</span>');
});

test("codeql highlights QLDoc doctags", () => {
  const result = highlight("/**\n * @kind problem\n */");

  expect(result).toContain('<span class="hljs-doctag">@kind</span>');
});

test("codeql highlights the $@ placeholder", () => {
  const result = highlight('select "Unused variable $@.", v');

  expect(result).toContain('<span class="hljs-meta">$@</span>');
});

test("codeql highlights the don't-care identifier", () => {
  const result = highlight("exists(_ | _ = 1)");

  expect(result).toContain('<span class="hljs-variable language_">_</span>');
});

test("codeql highlights keywords and types", () => {
  const result = highlight("predicate isEven(int x) { x % 2 = 0 }");

  expect(result).toContain('<span class="hljs-keyword">predicate</span>');
  expect(result).toContain('<span class="hljs-type">int</span>');
});
