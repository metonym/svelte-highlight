import { createRegistry } from "../src/engine.js";

import nomnoml from "../src/languages/nomnoml";

const registry = createRegistry();

registry.register(nomnoml.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "nomnoml" }).value;

test("nomnoml highlights directives", () => {
  const result = highlight("#direction: right");

  expect(result).toContain('<span class="hljs-meta">#direction: right</span>');
});

test("nomnoml highlights classifiers and node brackets", () => {
  const result = highlight("[<actor> User]");

  expect(result).toContain('<span class="hljs-type">&lt;actor&gt;</span>');
  expect(result).toContain('<span class="hljs-punctuation">[</span>');
  expect(result).toContain('<span class="hljs-punctuation">]</span>');
});

test("nomnoml highlights longer arrows before shorter ones", () => {
  const result = highlight("[A] <:-- [B]\n[B] -> [C]\n[C|login()]");

  expect(result).toContain('<span class="hljs-operator">&lt;:--</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-punctuation">|</span>');
});

test("nomnoml does not style a D2 attribute line", () => {
  const result = highlight("server.shape: cylinder");

  expect(result).not.toContain("hljs-");
});
