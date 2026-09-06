import { createRegistry } from "../src/engine.js";

import civet from "../src/languages/civet";

const registry = createRegistry();

registry.register(civet.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "civet" }).value;

test("civet highlights the declaration operator", () => {
  const result = highlight("x := 1");

  expect(result).toContain('<span class="hljs-operator">:=</span>');
});

test("civet highlights the pipe operator", () => {
  const result = highlight("result := x |> double");

  expect(result).toContain('<span class="hljs-operator">|&gt;</span>');
});

test("civet highlights word operators as keywords", () => {
  const result = highlight("unless result is 0\n  print result");

  expect(result).toContain('<span class="hljs-keyword">unless</span>');
  expect(result).toContain('<span class="hljs-keyword">is</span>');
});

test("civet highlights the this shorthand", () => {
  const result = highlight('@name = "civet"');

  expect(result).toContain('<span class="hljs-variable language_">@</span>');
});

test("civet highlights block and single-line comments", () => {
  const result = highlight("### block ###\n# single line");

  expect(result).toContain('<span class="hljs-comment">### block ###</span>');
  expect(result).toContain('<span class="hljs-comment"># single line</span>');
});

test("civet highlights strings and numbers", () => {
  const result = highlight('x := 1\ny := "hello"');

  expect(result).toContain('<span class="hljs-number">1</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;hello&quot;</span>',
  );
});
