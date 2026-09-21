import { createRegistry } from "../src/engine.js";

import asymptote from "../src/languages/asymptote";

const registry = createRegistry();

registry.register(asymptote.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "asymptote" }).value;

test("asymptote highlights type keywords", () => {
  const result = highlight("pair p;");

  expect(result).toContain('<span class="hljs-type">pair</span>');
});

test("asymptote highlights struct declarations", () => {
  const result = highlight("struct Point {\n  real x, y;\n}");

  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-type">real</span>');
});

test("asymptote highlights the ..controls.. path-join operator", () => {
  const result = highlight("path g = (0,0)..controls (1,1) and (2,0)..(3,0);");

  expect(result).toContain('<span class="hljs-operator">..controls</span>');
  expect(result).toContain('<span class="hljs-operator">..</span>');
});

test("asymptote highlights draw/fill built-ins", () => {
  const result = highlight("draw(g, red+linewidth(1));");

  expect(result).toContain('<span class="hljs-built_in">draw</span>');
});

test("asymptote highlights TeX-string and C-string variants", () => {
  const result = highlight(`label("origin", p, N);\nstring s = 'a\\tb';`);

  expect(result).toContain(
    '<span class="hljs-string">&quot;origin&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">&#x27;a\\tb&#x27;</span>',
  );
});

test("asymptote highlights import/comment neighbors without disturbing C++-style identifiers", () => {
  const result = highlight("import graph; // load the graph module");

  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain(
    '<span class="hljs-comment">// load the graph module</span>',
  );
});
