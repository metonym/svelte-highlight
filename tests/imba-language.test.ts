import { createRegistry } from "../src/engine.js";

import imba from "../src/languages/imba";

const registry = createRegistry();

registry.register(imba.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "imba" }).value;

test("imba highlights a tag literal with a class selector", () => {
  const result = highlight("<div.card>");

  expect(result).toContain('<span class="hljs-tag">&lt;div');
  expect(result).toContain('<span class="hljs-selector-class">.card</span>');
});

test("imba highlights the self tag with an event handler", () => {
  const result = highlight("<self @click=onClick>");

  expect(result).toContain('<span class="hljs-tag">&lt;self');
  expect(result).toContain('<span class="hljs-attr">@click</span>');
});

test("imba highlights keywords and literals", () => {
  const result = highlight("def render\n  if yes\n    self");

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-literal">yes</span>');
});

test("imba highlights comments", () => {
  const result = highlight("# a comment\ndef render");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});

test("imba highlights an inline css block", () => {
  const result = highlight("css .card\n  padding: 8px");

  expect(result).toContain('<span class="hljs-keyword">css</span>');
});
