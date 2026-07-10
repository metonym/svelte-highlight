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
