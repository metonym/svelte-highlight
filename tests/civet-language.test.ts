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

test("civet does not treat a private class field as a hash comment", () => {
  const result = highlight(
    "#!/usr/bin/env civet\nclass Circle\n  #radius: number\n  area() => @#radius * 2  # trailing",
  );

  expect(result).toContain(
    '#<span class="hljs-attr">radius</span>: <span class="hljs-built_in">number</span>',
  );
  expect(result).not.toContain('<span class="hljs-comment">#radius');
  expect(result).toContain('<span class="hljs-comment"># trailing</span>');
  expect(result).toContain('<span class="hljs-meta">#!');
});

test("civet highlights heredoc regexes and block strings", () => {
  const result = highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Civet's own ${} interpolation, not a JS template literal
    "re := ///\n  ^\\d+  # digits\n///gi\ns := \"\"\"\n  hi ${name}\n  \"\"\"\nt := '''raw'''",
  );

  expect(result).toContain(
    '<span class="hljs-regexp">///\n  ^\\d+  <span class="hljs-comment"># digits</span>\n///gi</span>',
  );
  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: Civet's own ${} interpolation, not a JS template literal
    '<span class="hljs-string">&quot;&quot;&quot;\n  hi <span class="hljs-subst">${name}</span>\n  &quot;&quot;&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">&#x27;&#x27;&#x27;raw&#x27;&#x27;&#x27;</span>',
  );
});

test("civet highlights for each/own, comptime, and operator declarations", () => {
  const result = highlight(
    "for each x of xs\n  x\nfor own k in obj\n  k\ncomptime 40 + 2\noperator plus(a, b) a + b\nz := 3 plus 4\neach := 1\noperator := 2",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">for</span> <span class="hljs-keyword">each</span> x <span class="hljs-keyword">of</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">for</span> <span class="hljs-keyword">own</span> k <span class="hljs-keyword">in</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">comptime</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">operator</span> <span class="hljs-title function_">plus</span>(a, b)',
  );
  expect(result).toContain('\neach <span class="hljs-operator">:=</span>');
  expect(result).toContain('\noperator <span class="hljs-operator">:=</span>');
});
