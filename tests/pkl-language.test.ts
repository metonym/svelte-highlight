import { createRegistry } from "../src/engine.js";

import pkl from "../src/languages/pkl";

const registry = createRegistry();

registry.register(pkl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "pkl" }).value;

test("pkl highlights function declarations", () => {
  const result = highlight("function add(x) = x");

  expect(result).toContain('<span class="hljs-keyword">function</span>');
  expect(result).toContain('<span class="hljs-title function_">add</span>');
});

test("pkl highlights structural keywords", () => {
  const result = highlight('amends "base.pkl"');

  expect(result).toContain('<span class="hljs-keyword">amends</span>');
});

test("pkl highlights builtin types", () => {
  const result = highlight('name: String = "x"');

  expect(result).toContain('<span class="hljs-type">String</span>');
});

test("pkl highlights strings and numbers", () => {
  const result = highlight('host = "localhost"\nport = 8080');

  expect(result).toContain(
    '<span class="hljs-string">&quot;localhost&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">8080</span>');
});

test("pkl highlights triple-quoted pound strings", () => {
  const result = highlight('x = #"""hello "# world"""#');

  expect(result).toContain(
    '<span class="hljs-string">#&quot;&quot;&quot;hello &quot;# world&quot;&quot;&quot;#</span>',
  );
});

test("pkl highlights dotted qualified annotations", () => {
  const result = highlight("@modulepath.SomeAnnotation\nclass Foo {}");

  expect(result).toContain(
    '<span class="hljs-meta">@modulepath.SomeAnnotation</span>',
  );
});
