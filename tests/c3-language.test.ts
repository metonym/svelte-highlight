import { createRegistry } from "../src/engine.js";

import c3 from "../src/languages/c3";

const registry = createRegistry();

registry.register(c3.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "c3" }).value;

test("c3 highlights the nextcase relevance carrier", () => {
  const result = highlight("nextcase default;");

  expect(result).toContain('<span class="hljs-keyword">nextcase</span>');
});

test("c3 highlights compile-time directives", () => {
  const result = highlight("$if $defined(x):\n$endif");

  expect(result).toContain('<span class="hljs-meta">$if</span>');
  expect(result).toContain('<span class="hljs-meta">$endif</span>');
});

test("c3 highlights attributes", () => {
  const result = highlight("@extern fn void foo();");

  expect(result).toContain('<span class="hljs-meta">@extern</span>');
  expect(result).toContain('<span class="hljs-keyword">fn</span>');
});

test("c3 highlights optional types and the rethrow operator", () => {
  const result = highlight("String? name;\nfoo()!;");

  expect(result).toContain('<span class="hljs-type">String</span>');
  expect(result).toContain('<span class="hljs-operator">?</span>');
  expect(result).toContain('<span class="hljs-operator">!</span>');
});

test("c3 highlights comments, strings, and numbers", () => {
  const result = highlight('// a comment\nint x = 42;\nString s = "hi";');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-number">42</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("c3 highlights number literals with separators, prefixes, suffixes, and ranges", () => {
  const result = highlight(
    "const int MAX = 1_000_000;\nconst MASK = 0xff_ffu;\nconst BITS = 0b1010;\nconst OCT = 0o755;\nconst float F = 1.5f;\nint[] s = arr[1..2];",
  );

  expect(result).toContain('<span class="hljs-number">1_000_000</span>');
  expect(result).toContain('<span class="hljs-number">0xff_ffu</span>');
  expect(result).toContain('<span class="hljs-number">0b1010</span>');
  expect(result).toContain('<span class="hljs-number">0o755</span>');
  expect(result).toContain('<span class="hljs-number">1.5f</span>');
  expect(result).toContain(
    '[<span class="hljs-number">1</span>..<span class="hljs-number">2</span>]',
  );
});

test("c3 highlights literals, char, raw, and prefixed strings", () => {
  const result = highlight(
    'bool b = true && !false;\nvoid* n = null;\nchar c = \'a\';\nString s = `raw\\n`;\nchar[*] h = x"deadbeef";\nchar[*] e = b64"aGk=";',
  );

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;a&#x27;</span>');
  expect(result).toContain('<span class="hljs-string">`raw\\n`</span>');
  expect(result).toContain(
    '<span class="hljs-string">x&quot;deadbeef&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">b64&quot;aGk=&quot;</span>',
  );
});

test("c3 highlights doc comments with contract tags", () => {
  const result = highlight(
    '<*\n Computes the area.\n @require x > 0\n @return "the area"\n*>\nfn int area(int x) { return x; }',
  );

  expect(result).toContain('<span class="hljs-comment">&lt;*');
  expect(result).toContain(
    '<span class="hljs-doctag">@require</span> x &gt; 0',
  );
  expect(result).toContain('<span class="hljs-doctag">@return</span>');
  expect(result).toContain("*&gt;</span>");
  // `@return` in the doc comment is not the `return` keyword.
  expect(result).not.toContain('@<span class="hljs-keyword">return</span>');
});

test("c3 styles function and macro declaration names", () => {
  const result = highlight(
    "fn double? area(Point* p) { return 1.0; }\nfn void Point.move(Point* self) {}\nmacro @swap(&a, &b) { }\nmacro long sum(long... args) { return 0; }\nalias Callback = fn void(int);",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">fn</span> <span class="hljs-type">double?</span> <span class="hljs-title function_">area</span>(',
  );
  expect(result).toContain(
    '<span class="hljs-title function_">Point.move</span>(',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">macro</span> <span class="hljs-title function_">@swap</span>(',
  );
  expect(result).toContain(
    '<span class="hljs-type">long</span> <span class="hljs-title function_">sum</span>(',
  );
  // A function-pointer type has no name to style.
  expect(result).toContain(
    '<span class="hljs-keyword">fn</span> <span class="hljs-type">void</span>(<span class="hljs-type">int</span>)',
  );
});

test("c3 highlights $defined and $endforeach compile-time directives", () => {
  const result = highlight(
    "$if $defined(FOO):\n$endif\n$foreach $t : $types:\n$endforeach\nint x = $alignof(int);",
  );

  expect(result).toContain('<span class="hljs-meta">$defined</span>(');
  expect(result).toContain('<span class="hljs-meta">$endforeach</span>');
  expect(result).toContain('<span class="hljs-meta">$alignof</span>(');
});
