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
