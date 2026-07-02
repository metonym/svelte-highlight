import hljs from "highlight.js/lib/core";
import d2 from "../src/languages/d2";

hljs.registerLanguage(d2.name, d2.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "d2" }).value;

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
