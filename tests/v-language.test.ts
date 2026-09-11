import { createRegistry } from "../src/engine.js";

import v from "../src/languages/v";

const registry = createRegistry();

registry.register(v.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "v" }).value;

test("v highlights fn declarations", () => {
  const result = highlight("fn main() {}");

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-title function_">main</span>');
});

test("v highlights builtin types", () => {
  const result = highlight("mut x := int(1)");

  expect(result).toContain('<span class="hljs-keyword">mut</span>');
  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("v highlights struct types", () => {
  const result = highlight("struct Point {}");

  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-type">Point</span>');
});

test("v highlights strings and numbers", () => {
  const result = highlight('name := "v"\nport := 8080');

  expect(result).toContain('<span class="hljs-string">&quot;v&quot;</span>');
  expect(result).toContain('<span class="hljs-number">8080</span>');
});

test("v highlights comptime $if/$else as keywords", () => {
  const result = highlight(
    "$if windows { println('win') } $else { println('other') }",
  );

  expect(result).toContain('<span class="hljs-keyword">$if</span>');
  expect(result).toContain('<span class="hljs-keyword">$else</span>');
});

test("v highlights comptime $for as a keyword", () => {
  const result = highlight("$for field in T.fields {}");

  expect(result).toContain('<span class="hljs-keyword">$for</span>');
});

test("v highlights the ? prefix of an optional type", () => {
  const result = highlight("fn foo() ?int { return none }");

  expect(result).toContain('<span class="hljs-type">?</span>');
  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("v does not process escapes or interpolation inside raw strings", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  const raw = highlight("r'C:\\Users\\${name}'");

  expect(raw).not.toContain('<span class="hljs-subst">');
  expect(raw).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
    '<span class="hljs-string">r&#x27;C:\\Users\\${name}&#x27;</span>',
  );

  // regression check: the same content in a plain (non-raw) string still
  // gets interpolation processed
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  const plain = highlight("'C:\\Users${name}'");
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  expect(plain).toContain('<span class="hljs-subst">${name}</span>');
});

test("v highlights @[...] attributes and C directives", () => {
  const result = highlight(
    "#include <stdio.h>\n#flag -lm\n\n@[heap; noinit]\npub struct Point { x int }\n\n@[params]\nstruct Config {}\n\n[inline]\nfn old() {}\nnums := [1, 2]\n",
  );

  expect(result).toContain(
    '<span class="hljs-meta">#include &lt;stdio.h&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-meta">#flag -lm</span>');
  expect(result).toContain('<span class="hljs-meta">@[heap; noinit]</span>');
  expect(result).toContain('<span class="hljs-meta">@[params]</span>');
  expect(result).toContain('<span class="hljs-meta">[inline]</span>');
  // An array literal is not an attribute.
  expect(result).toContain(
    'nums := [<span class="hljs-number">1</span>, <span class="hljs-number">2</span>]',
  );
});

test("v highlights method names after a receiver", () => {
  const result = highlight(
    "fn (p &Point) scale(k int) Point { return p }\nfn (mut s Stack[T]) push[T](x T) {}\nsq := fn (x int) int { return x * x }",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">fn</span> (p &amp;<span class="hljs-type">Point</span>) <span class="hljs-title function_">scale</span>(k <span class="hljs-type">int</span>)',
  );
  expect(result).toContain(
    '(<span class="hljs-keyword">mut</span> s <span class="hljs-type">Stack</span>[<span class="hljs-type">T</span>]) <span class="hljs-title function_">push</span>[',
  );
  // An anonymous function literal has no name to style.
  expect(result).toContain(
    '<span class="hljs-keyword">fn</span> (x <span class="hljs-type">int</span>) <span class="hljs-type">int</span> {',
  );
  expect(result).not.toContain('hljs-title function_">int');
});
