import { createRegistry } from "../src/engine.js";

import slint from "../src/languages/slint";

const registry = createRegistry();

registry.register(slint.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "slint" }).value;

test("slint highlights the two-way binding operator", () => {
  const result = highlight("x <=> root.value;");

  expect(result).toContain('<span class="hljs-operator">&lt;=&gt;</span>');
});

test("slint highlights in-out property declarations", () => {
  const result = highlight("in-out property <int> value: 0;");

  expect(result).toContain('<span class="hljs-keyword">in-out</span>');
  expect(result).toContain('<span class="hljs-keyword">property</span>');
});

test("slint highlights element instantiation as a class title", () => {
  const result = highlight("Handle := Rectangle {");

  expect(result).toContain('<span class="hljs-title class_">Handle</span>');
  expect(result).toContain('<span class="hljs-title class_">Rectangle</span>');
});

test("slint highlights colors and units on numbers", () => {
  const result = highlight("width: 200px;\nbackground: #3a3a3a;");

  expect(result).toContain('<span class="hljs-number">200px</span>');
  expect(result).toContain('<span class="hljs-number">#3a3a3a</span>');
});

test("slint highlights comments and strings", () => {
  const result = highlight(
    '// a comment\nimport { Button } from "std-widgets.slint";',
  );

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain('<span class="hljs-keyword">from</span>');
});

test("slint does not highlight in/out inside easing names", () => {
  const result = highlight("easing: ease-in-out;");

  expect(result).not.toContain('<span class="hljs-keyword">in-out</span>');
  expect(result).not.toContain('<span class="hljs-keyword">in</span>');
  expect(result).not.toContain('<span class="hljs-keyword">out</span>');
});

test("slint still highlights in-out property modifiers", () => {
  const result = highlight("in-out property <int> count: 0;");

  expect(result).toContain('<span class="hljs-keyword">in-out</span>');
});

test("slint highlights string interpolations", () => {
  const result = highlight('"Count: \\{root.count}"');

  expect(result).toContain('<span class="hljs-subst">\\{root.count}</span>');
});
