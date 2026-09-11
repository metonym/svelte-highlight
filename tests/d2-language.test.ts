import { createRegistry } from "../src/engine.js";

import d2 from "../src/languages/d2";

const registry = createRegistry();

registry.register(d2.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "d2" }).value;

test("d2 highlights connection operators", () => {
  const result = highlight("a -> b: request");

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("d2 highlights shape attributes", () => {
  const result = highlight("server.shape: cylinder");

  expect(result).toContain('<span class="hljs-keyword">.shape</span>');
});

test("d2 highlights shape values", () => {
  const result = highlight("db.shape: cylinder");

  expect(result).toContain('<span class="hljs-literal">cylinder</span>');
});

test("d2 highlights comments", () => {
  const result = highlight("# diagram\na -> b");

  expect(result).toContain('<span class="hljs-comment"># diagram</span>');
});

test("d2 highlights nested style sub-properties", () => {
  const result = highlight("server.style.fill: red");

  expect(result).toContain('<span class="hljs-keyword">.style.fill</span>');
});

test("d2 highlights hyphenated style sub-properties", () => {
  const result = highlight("server.style.stroke-width: 2");

  expect(result).toContain(
    '<span class="hljs-keyword">.style.stroke-width</span>',
  );
});

test("d2 highlights the direction attribute", () => {
  const result = highlight("x.direction: right");

  expect(result).toContain('<span class="hljs-keyword">.direction</span>');
});

test("d2 recognizes layers, scenarios, and steps as keywords", () => {
  const result = highlight(
    "layers.detail.shape: cylinder\nscenarios.happy.shape: cylinder\nsteps.first.shape: cylinder",
  );

  expect(result).toContain('<span class="hljs-keyword">layers</span>');
  expect(result).toContain('<span class="hljs-keyword">scenarios</span>');
  expect(result).toContain('<span class="hljs-keyword">steps</span>');
});

test("d2 highlights suspend and unsuspend instead of folding them into the next key", () => {
  const result = highlight(
    "suspend model: {\n  db.shape: cylinder\n}\nunsuspend model",
  );

  expect(result).toContain('<span class="hljs-keyword">suspend</span>');
  expect(result).toContain('<span class="hljs-keyword">unsuspend</span>');
  expect(result).not.toContain('<span class="hljs-attr">suspend model</span>');
});

// biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
test("d2 highlights ${} substitutions and |md block strings", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  const result = highlight('x: "${primary}"\nlabel: |md\n  **hi**\n|');

  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  expect(result).toContain('<span class="hljs-subst">${primary}</span>');
  expect(result).toContain('<span class="hljs-string">|md\n  **hi**\n|</span>');
});

test("d2 still highlights a quoted label that is not a block string", () => {
  const result = highlight('x: "not a block"');

  expect(result).toContain(
    '<span class="hljs-string">&quot;not a block&quot;</span>',
  );
  expect(result).not.toContain('<span class="hljs-string">|');
});
