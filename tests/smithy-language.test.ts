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
