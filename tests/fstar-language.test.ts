import { createRegistry } from "../src/engine.js";

import fstar from "../src/languages/fstar";

const registry = createRegistry();

registry.register(fstar.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "fstar" }).value;

test("fstar highlights let/val headers as title.function", () => {
  const result = highlight("let rec factorial (n:nat) : nat = n");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">rec</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">factorial</span>',
  );
});

test("fstar highlights Lemma/requires/ensures as the contract vocabulary", () => {
  const result = highlight(
    "val f : n:nat -> Lemma (requires True) (ensures (f n >= 1))",
  );

  expect(result).toContain('<span class="hljs-built_in">Lemma</span>');
  expect(result).toContain('<span class="hljs-keyword">requires</span>');
  expect(result).toContain('<span class="hljs-keyword">ensures</span>');
});

test("fstar highlights nested (* *) comments", () => {
  const result = highlight("(* outer (* inner *) still outer *)");

  expect(result).toBe(
    '<span class="hljs-comment">(* outer <span class="hljs-comment">(* inner *)</span> still outer *)</span>',
  );
});

test("fstar highlights noeq record types and the Tot effect", () => {
  const result = highlight(
    "noeq type stream (a:Type) = {\n  head: a;\n  tail: unit -> Tot (stream a);\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">noeq</span>');
  expect(result).toContain('<span class="hljs-built_in">Tot</span>');
});

test("fstar highlights // comments and strings", () => {
  const result = highlight('// a comment\nlet msg = "hi"');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("fstar does not raise relevance on bare OCaml-shaped code (no contract vocabulary)", () => {
  const result = highlight(
    "let rec fib n =\n  if n < 2 then n else fib (n - 1) + fib (n - 2)",
  );

  expect(result).not.toContain('<span class="hljs-built_in">Lemma</span>');
  expect(result).not.toContain('<span class="hljs-keyword">requires</span>');
});
