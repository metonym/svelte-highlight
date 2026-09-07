import { createRegistry } from "../src/engine.js";

import ron from "../src/languages/ron";

const registry = createRegistry();

registry.register(ron.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "ron" }).value;

test("ron highlights attributes with high relevance", () => {
  const result = highlight("#![enable(implicit_some)]");

  expect(result).toContain(
    '<span class="hljs-meta">#![enable(implicit_some)]</span>',
  );
});

test("ron highlights struct names before ( or {", () => {
  const result = highlight("GameConfig(\n    volume: 0.8,\n)");

  expect(result).toContain('<span class="hljs-title class_">GameConfig</span>');
});

test("ron highlights field names as attrs", () => {
  const result = highlight("volume: 0.8");

  expect(result).toContain('<span class="hljs-attr">volume</span>');
});

test("ron highlights bare PascalCase identifiers as literals", () => {
  const result = highlight("difficulty: Hard");

  expect(result).toContain('<span class="hljs-literal">Hard</span>');
});

test("ron highlights None and boolean literals", () => {
  const result = highlight("save_slot: None\nfullscreen: false");

  expect(result).toContain('<span class="hljs-literal">None</span>');
  expect(result).toContain('<span class="hljs-literal">false</span>');
});

test("ron highlights strings, numbers, and comments", () => {
  const result = highlight(
    '// a comment\nwindow_title: "My Game"\nresolution: (1920, 1080)',
  );

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;My Game&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">1920</span>');
});
