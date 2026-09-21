import { createRegistry } from "../src/engine.js";

import pikchr from "../src/languages/pikchr";

const registry = createRegistry();

registry.register(pikchr.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "pikchr" }).value;

test("pikchr highlights objects, strings, and fit", () => {
  const result = highlight('box "Start" fit');

  expect(result).toContain('<span class="hljs-keyword">box</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;Start&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">fit</span>');
});

test("pikchr highlights directions and compass points on a line", () => {
  const result = highlight("arrow down 50%\nline from Start.s to Stop.n");

  expect(result).toContain('<span class="hljs-keyword">arrow</span>');
  expect(result).toContain('<span class="hljs-keyword">down</span>');
  expect(result).toContain('<span class="hljs-number">50%</span>');
  expect(result).toContain('<span class="hljs-keyword">from</span>');
  expect(result).toContain('<span class="hljs-keyword">to</span>');
});

test("pikchr highlights comments and radius", () => {
  const result = highlight("# endpoint\ncircle rad 0.3");

  expect(result).toContain('<span class="hljs-comment"># endpoint</span>');
  expect(result).toContain('<span class="hljs-keyword">rad</span>');
  expect(result).toContain('<span class="hljs-number">0.3</span>');
});

test("pikchr does not treat a Graphviz edge or rectangle as syntax", () => {
  const result = highlight("rectangle -> node");

  expect(result).not.toContain("hljs-keyword");
  expect(result).not.toContain("hljs-operator");
});
