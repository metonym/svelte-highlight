import { createRegistry } from "../src/engine.js";

import roc from "../src/languages/roc";

const registry = createRegistry();

registry.register(roc.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "roc" }).value;

test("roc highlights the app header as the relevance carrier", () => {
  const result = highlight('app [main] { pf: platform "https://example.com" }');

  expect(result).toContain('<span class="hljs-meta">app [main]</span>');
});

test("roc highlights tags as class titles", () => {
  const result = highlight('Ok _ -> Stdout.line "done"');

  expect(result).toContain('<span class="hljs-title class_">Ok</span>');
  expect(result).toContain('<span class="hljs-title class_">Stdout</span>');
});

test("roc highlights backpassing and arrow operators", () => {
  const result = highlight("result <- Task.await task");

  expect(result).toContain('<span class="hljs-operator">&lt;-</span>');
});

test("roc highlights string interpolation", () => {
  const result = highlight('"Hello, $(name)!"');

  expect(result).toContain('<span class="hljs-subst">$(name)</span>');
});

test("roc highlights keywords and built-ins", () => {
  const result = highlight("when result is\n  _ -> dbg result");

  expect(result).toContain('<span class="hljs-keyword">when</span>');
  expect(result).toContain('<span class="hljs-keyword">is</span>');
  expect(result).toContain('<span class="hljs-built_in">dbg</span>');
});
