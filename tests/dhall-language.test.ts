import { createRegistry } from "../src/engine.js";

import dhall from "../src/languages/dhall";

const registry = createRegistry();

registry.register(dhall.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dhall" }).value;

test("dhall highlights let/in keywords", () => {
  const result = highlight("let x = 1 in x");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
});

test("dhall highlights builtin types", () => {
  const result = highlight("let n : Natural = 1");

  expect(result).toContain('<span class="hljs-type">Natural</span>');
});

test("dhall highlights namespaced builtins", () => {
  const result = highlight("Natural/fold 3");

  expect(result).toContain('<span class="hljs-built_in">Natural/fold</span>');
});

test("dhall highlights literals", () => {
  const result = highlight("let b = True");

  expect(result).toContain('<span class="hljs-literal">True</span>');
});

test("dhall highlights lambda syntax operators", () => {
  const asciiResult = highlight("\\(x : Natural) -> x");

  expect(asciiResult).toContain('<span class="hljs-operator">\\</span>');
  expect(asciiResult).toContain('<span class="hljs-operator">-&gt;</span>');

  const unicodeResult = highlight("λ(x : Natural) → x");

  expect(unicodeResult).toContain('<span class="hljs-operator">λ</span>');
  expect(unicodeResult).toContain('<span class="hljs-operator">→</span>');
});

test("dhall nests block comments", () => {
  const result = highlight("{- outer {- inner -} still -}\nlet x = 1");

  expect(result).toContain(
    '<span class="hljs-comment">{- outer <span class="hljs-comment">{- inner -}</span> still -}</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">let</span>');
});

test("dhall keeps a multi-line string open across the ''${ escape", () => {
  const result = highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: dhall uses literal ${x} interpolation
    "let s = ''\n  ''${literal} and '''quoted''' and ${x}\n  ''\nin s",
  );

  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting the literal ''${ escape
    "&#x27;&#x27;${literal} and &#x27;&#x27;&#x27;quoted&#x27;&#x27;&#x27; and " +
      // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting the literal ${x} token
      '<span class="hljs-subst">${x}</span>\n  &#x27;&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">in</span> s');
});

test("dhall highlights date, time, and time-zone literals as one number", () => {
  const result = highlight(
    "{ d = 2024-01-15, t = 12:30:00.5, z = +05:30, ts = 2024-01-15T12:30:00Z, n = -42 }",
  );

  expect(result).toContain('<span class="hljs-number">2024-01-15</span>');
  expect(result).toContain('<span class="hljs-number">12:30:00.5</span>');
  expect(result).toContain('<span class="hljs-number">+05:30</span>');
  expect(result).toContain(
    '<span class="hljs-number">2024-01-15T12:30:00Z</span>',
  );
  expect(result).toContain('<span class="hljs-number">-42</span>');
});

test("dhall highlights bytes literals and newer keywords and builtins", () => {
  const result = highlight(
    'let b = 0x"00FF"\nlet c = showConstructor r\nlet d = Date/show 2024-01-15\nlet m = missing\nin b',
  );

  expect(result).toContain(
    '<span class="hljs-number">0x&quot;00FF&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">showConstructor</span>');
  expect(result).toContain('<span class="hljs-built_in">Date/show</span>');
  expect(result).toContain('<span class="hljs-keyword">missing</span>');
});

test("dhall highlights record, list, and text operators", () => {
  const result = highlight(
    'r // { a = 1 } /\\ s //\\ T\n[ 1 ] # [ 2 ]\n"a" ++ "b"\nassert : x === y\n∀(a : Type) → a\n-- not // an operator',
  );

  expect(result).toContain('<span class="hljs-operator">//</span> {');
  expect(result).toContain('<span class="hljs-operator">/\\</span> s');
  expect(result).toContain('<span class="hljs-operator">//\\</span> T');
  expect(result).toContain('<span class="hljs-operator">#</span>');
  expect(result).toContain('<span class="hljs-operator">++</span>');
  expect(result).toContain('<span class="hljs-operator">===</span>');
  expect(result).toContain('<span class="hljs-operator">∀</span>');
  expect(result).toContain(
    '<span class="hljs-comment">-- not // an operator</span>',
  );
});
