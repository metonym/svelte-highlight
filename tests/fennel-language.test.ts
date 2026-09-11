import { createRegistry } from "../src/engine.js";

import fennel from "../src/languages/fennel";

const registry = createRegistry();

registry.register(fennel.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "fennel" }).value;

test("fennel highlights special forms", () => {
  const result = highlight("(fn add [a b]\n  (+ a b))");

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
});

test("fennel highlights :keyword strings distinctly from regular strings", () => {
  const result = highlight('(local greeting :hello)\n(print "done")');

  expect(result).toContain('<span class="hljs-symbol">:hello</span>');
  expect(result).toContain('<span class="hljs-string">&quot;done&quot;</span>');
});

test("fennel highlights Lua built-ins", () => {
  const result = highlight("(each [i v (ipairs [1 2 3])]\n  (print i v))");

  expect(result).toContain('<span class="hljs-built_in">ipairs</span>');
  expect(result).toContain('<span class="hljs-built_in">print</span>');
});

test("fennel highlights line comments and numbers", () => {
  const result = highlight(";; a comment\n(local x 0x1F)");

  expect(result).toContain('<span class="hljs-comment">;; a comment</span>');
  expect(result).toContain('<span class="hljs-number">0x1F</span>');
});

test("fennel does not treat the colon of a method call as a keyword string", () => {
  const result = highlight(
    '(with-open [f (io.open "x")] (f:read "*a"))\n(obj:method :arg)',
  );

  expect(result).toContain("(f:read ");
  expect(result).toContain(
    '(obj:method <span class="hljs-symbol">:arg</span>)',
  );
  expect(result).not.toContain('<span class="hljs-symbol">:read</span>');
  expect(result).not.toContain('<span class="hljs-symbol">:method</span>');
});

test("fennel still highlights keyword strings after whitespace and delimiters", () => {
  const result = highlight("{:a 1 :b 2}\n(f :x)\n[:y]\n:top");

  expect(result).toContain('{<span class="hljs-symbol">:a</span>');
  expect(result).toContain(' <span class="hljs-symbol">:b</span>');
  expect(result).toContain('(f <span class="hljs-symbol">:x</span>)');
  expect(result).toContain('[<span class="hljs-symbol">:y</span>]');
  expect(result).toContain('\n<span class="hljs-symbol">:top</span>');
});

test("fennel highlights Fennel 1.x special forms and macros", () => {
  const result = highlight(
    "(case x {:k v} v)\n(case-try (f) 1 (g) (catch _ nil))\n(tset t :k 1)\n(fcollect [i 1 5] i)\n(-> t (. :k) (?. :j))\n(doto t (tset :d 4))\n(when (not= n 0) (tail! (main)))\n(import-macros {: m} :macros)",
  );

  for (const keyword of [
    "case",
    "case-try",
    "catch",
    "tset",
    "fcollect",
    "-&gt;",
    ".",
    "?.",
    "doto",
    "not=",
    "tail!",
    "import-macros",
  ]) {
    expect(result).toContain(`<span class="hljs-keyword">${keyword}</span>`);
  }
});

test("fennel styles true/false/nil as literals", () => {
  const result = highlight("(if (and true false) nil)");

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">false</span>');
  expect(result).toContain('<span class="hljs-literal">nil</span>');
  expect(result).toContain('<span class="hljs-keyword">and</span>');
});
