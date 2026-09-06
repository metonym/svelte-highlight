import { createRegistry } from "../src/engine.js";

import koka from "../src/languages/koka";

const registry = createRegistry();

registry.register(koka.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "koka" }).value;

test("koka highlights the effect and ctl relevance carriers", () => {
  const result = highlight("effect ctl ask() : int");

  expect(result).toContain('<span class="hljs-keyword">effect</span>');
  expect(result).toContain('<span class="hljs-keyword">ctl</span>');
});

test("koka highlights effect types after a colon", () => {
  const result = highlight("fun greet() : <ask,console> ()");

  expect(result).toContain(
    '<span class="hljs-type">&lt;ask,console&gt;</span>',
  );
});

test("koka highlights keywords and literals", () => {
  const result = highlight("fun main()\n  if True then 1 else 2");

  expect(result).toContain('<span class="hljs-keyword">fun</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-literal">True</span>');
});

test("koka highlights comments", () => {
  const result = highlight("// a comment\n/* block */\nfun main() {}");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-comment">/* block */</span>');
});

test("koka highlights strings and numbers", () => {
  const result = highlight('val x = 42\nval s = "hello"');

  expect(result).toContain('<span class="hljs-number">42</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;hello&quot;</span>',
  );
});
