import { createRegistry } from "../src/engine.js";

import dafny from "../src/languages/dafny";

const registry = createRegistry();

registry.register(dafny.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dafny" }).value;

test("dafny highlights a method header as title.function", () => {
  const result = highlight("method Factorial(n: nat) returns (result: nat)");

  expect(result).toContain('<span class="hljs-keyword">method</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">Factorial</span>',
  );
});

test("dafny highlights requires/ensures/invariant/decreases", () => {
  const result = highlight(
    "method M(n: nat)\n  requires n >= 0\n  ensures true\n{\n  while true\n    invariant true\n    decreases n\n  {}\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">requires</span>');
  expect(result).toContain('<span class="hljs-keyword">ensures</span>');
  expect(result).toContain('<span class="hljs-keyword">invariant</span>');
  expect(result).toContain('<span class="hljs-keyword">decreases</span>');
});

test("dafny highlights a class/datatype header as title.class", () => {
  const result = highlight(
    "class Counter {}\ndatatype Option<T> = None | Some(value: T)",
  );

  expect(result).toContain('<span class="hljs-title class_">Counter</span>');
  expect(result).toContain('<span class="hljs-title class_">Option</span>');
  expect(result).toContain('<span class="hljs-keyword">datatype</span>');
});

test("dafny highlights // and /* */ comments", () => {
  const result = highlight("// a comment\n/* block */\nvar x := 1;");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-comment">/* block */</span>');
});

test("dafny highlights operators, longest match first", () => {
  const result = highlight(
    "lemma L() ensures true <==> true {}\nmethod M() ensures 1 <= 2 {}",
  );

  expect(result).toContain('<span class="hljs-operator">&lt;==&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">&lt;=</span>');
});

test("dafny does not raise relevance on the generic class header (C#-shaped code stays untouched)", () => {
  const result = highlight(
    "class Counter {\n  private int value;\n  public int Get() { return value; }\n}",
  );

  expect(result).toContain('<span class="hljs-title class_">Counter</span>');
  expect(result).not.toContain('<span class="hljs-keyword">private</span>');
});
