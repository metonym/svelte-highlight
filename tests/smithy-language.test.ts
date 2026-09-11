import { createRegistry } from "../src/engine.js";

import smithy from "../src/languages/smithy";

const registry = createRegistry();

registry.register(smithy.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "smithy" }).value;

test("smithy highlights the version control statement as the relevance carrier", () => {
  const result = highlight('$version: "2"');

  expect(result).toContain(
    '<span class="hljs-meta">$version: &quot;2&quot;</span>',
  );
});

test("smithy highlights traits", () => {
  const result = highlight("@readonly\nstructure User {}");

  expect(result).toContain('<span class="hljs-meta">@readonly</span>');
  expect(result).toContain('<span class="hljs-keyword">structure</span>');
});

test("smithy highlights shape IDs", () => {
  const result = highlight("resources: [com.example#User]");

  expect(result).toContain('<span class="hljs-symbol">com.example#User</span>');
});

test("smithy highlights doc comments", () => {
  const result = highlight("/// A simple user shape\nstructure User {}");

  expect(result).toContain(
    '<span class="hljs-comment">/// A simple user shape</span>',
  );
});

test("smithy highlights built-in types and strings", () => {
  const result = highlight('name: String\nversion: "2024-01-01"');

  expect(result).toContain(
    '<span class="hljs-string">&quot;2024-01-01&quot;</span>',
  );
});

test("smithy highlights node value literals", () => {
  const result = highlight(
    "structure Foo {\n    flag: Boolean = true\n    @default(null)\n    other: Boolean = false\n}",
  );

  expect(result).toContain('= <span class="hljs-literal">true</span>');
  expect(result).toContain('(<span class="hljs-literal">null</span>)');
  expect(result).toContain('= <span class="hljs-literal">false</span>');
});

test("smithy highlights elided members but not member shape IDs", () => {
  const result = highlight(
    'operation GetCity {\n    input := for City {\n        @required\n        $cityId\n    }\n}\napply Foo$count @documentation("x")',
  );

  expect(result).toContain('<span class="hljs-variable">$cityId</span>');
  expect(result).toContain('<span class="hljs-keyword">apply</span> Foo$count');
  expect(result).not.toContain('Foo<span class="hljs-variable">$count');
  expect(result).toContain('<span class="hljs-keyword">for</span> City');
});

test("smithy keeps the version control statement as meta", () => {
  const result = highlight('$version: "2.0"\nnamespace com.example');

  expect(result).toContain(
    '<span class="hljs-meta">$version: &quot;2.0&quot;</span>',
  );
  expect(result).not.toContain('hljs-variable">$version');
});
