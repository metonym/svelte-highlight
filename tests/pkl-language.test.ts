import { createRegistry } from "../src/engine.js";

import pkl from "../src/languages/pkl";

const registry = createRegistry();

registry.register(pkl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "pkl" }).value;

test("pkl highlights function declarations", () => {
  const result = highlight("function add(x) = x");

  expect(result).toContain('<span class="hljs-keyword">function</span>');
  expect(result).toContain('<span class="hljs-title function_">add</span>');
});

test("pkl highlights structural keywords", () => {
  const result = highlight('amends "base.pkl"');

  expect(result).toContain('<span class="hljs-keyword">amends</span>');
});

test("pkl highlights builtin types", () => {
  const result = highlight('name: String = "x"');

  expect(result).toContain('<span class="hljs-type">String</span>');
});

test("pkl highlights strings and numbers", () => {
  const result = highlight('host = "localhost"\nport = 8080');

  expect(result).toContain(
    '<span class="hljs-string">&quot;localhost&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">8080</span>');
});

test("pkl highlights string interpolation and balances nested parens", () => {
  const result = highlight('message = "Count: \\(items.size())"');

  expect(result).toContain('<span class="hljs-subst">\\(items.size())</span>');
});

test("pkl highlights triple-quoted pound strings", () => {
  const result = highlight('x = #"""hello "# world"""#');

  expect(result).toContain(
    '<span class="hljs-string">#&quot;&quot;&quot;hello &quot;# world&quot;&quot;&quot;#</span>',
  );
});

test("pkl highlights dotted qualified annotations", () => {
  const result = highlight("@modulepath.SomeAnnotation\nclass Foo {}");

  expect(result).toContain(
    '<span class="hljs-meta">@modulepath.SomeAnnotation</span>',
  );
});

test("pkl highlights class and typealias names", () => {
  const result = highlight(
    "abstract class Server extends Base {}\ntypealias Port = Int(this > 0)\nclassy = 1",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">class</span> <span class="hljs-title class_">Server</span> <span class="hljs-keyword">extends</span> Base',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">typealias</span> <span class="hljs-title class_">Port</span>',
  );
  expect(result).toContain("classy = <span");
});

test("pkl interpolates \\#( ) inside pound strings but not \\( )", () => {
  const result = highlight(
    'a = #"v \\#(name) \\(raw)"#\nb = #"""\n\\#(x)\n"""#',
  );

  expect(result).toContain(
    '<span class="hljs-string">#&quot;v <span class="hljs-subst">\\#(name)</span> \\(raw)&quot;#</span>',
  );
  expect(result).toContain('<span class="hljs-subst">\\#(x)</span>');
});

test("pkl styles unknown, nothing, and newer base classes as types", () => {
  const result = highlight(
    "x: unknown = 1\ny: nothing\nb: Bytes = Bytes(1, 2)\nr: Regex\nn = null",
  );

  expect(result).toContain('<span class="hljs-type">unknown</span>');
  expect(result).toContain('<span class="hljs-type">nothing</span>');
  expect(result).toContain('<span class="hljs-type">Bytes</span>');
  expect(result).toContain('<span class="hljs-type">Regex</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
  expect(result).not.toContain('<span class="hljs-literal">nothing</span>');
});
