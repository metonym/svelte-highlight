import { createRegistry } from "../src/engine.js";

import lean from "../src/languages/lean";

const registry = createRegistry();

registry.register(lean.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "lean" }).value;

test("lean highlights def/theorem names as title.function", () => {
  const result = highlight("def succ (n : Nat) : Nat := n + 1");

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain('<span class="hljs-title function_">succ</span>');
});

test("lean highlights unicode identifiers in a def name", () => {
  const result = highlight("theorem succ_pos : True := by trivial");

  expect(result).toContain(
    '<span class="hljs-title function_">succ_pos</span>',
  );
});

test("lean highlights unicode operators", () => {
  const result = highlight("∀ n : ℕ, n = n");

  expect(result).toContain('<span class="hljs-operator">∀</span>');
  expect(result).toContain('<span class="hljs-operator">ℕ</span>');
});

test("lean highlights line comments and strings", () => {
  const result = highlight('-- a comment\ndef greeting : String := "hi"');

  expect(result).toContain('<span class="hljs-comment">-- a comment</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("lean highlights nested block comments", () => {
  const result = highlight("/- outer /- inner -/ still outer -/");

  expect(result).toBe(
    '<span class="hljs-comment">/- outer <span class="hljs-comment">/- inner -/</span> still outer -/</span>',
  );
});

test("lean highlights Lean 4 do-notation and command keywords", () => {
  const result = highlight(
    "opaque secret : Nat\nset_option pp.all true\ndef f (xs : List Nat) : IO Nat := do\n  let mut acc := 0\n  for x in xs do\n    acc := acc + x\n  return acc\ntermination_by xs.length",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">opaque</span> <span class="hljs-title function_">secret</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">set_option</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">let</span> <span class="hljs-keyword">mut</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">for</span> x <span class="hljs-keyword">in</span> xs <span class="hljs-keyword">do</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">return</span>');
  expect(result).toContain('<span class="hljs-keyword">termination_by</span>');
});

test("lean highlights #-commands as meta and Type/Prop as built-ins", () => {
  const result = highlight(
    "#eval f 1\n#check @Nat.add\ninductive T (α : Type u) : Prop where\n  | leaf",
  );

  expect(result).toContain('<span class="hljs-meta">#eval</span>');
  expect(result).toContain('<span class="hljs-meta">#check</span>');
  expect(result).toContain('<span class="hljs-built_in">Type</span> u');
  expect(result).toContain('<span class="hljs-built_in">Prop</span>');
});

test("lean highlights exponent, hex, and binary numbers", () => {
  const result = highlight("x := 2.5e1 + 0xFF + 0b1010 + 42");

  expect(result).toContain('<span class="hljs-number">2.5e1</span>');
  expect(result).toContain('<span class="hljs-number">0xFF</span>');
  expect(result).toContain('<span class="hljs-number">0b1010</span>');
  expect(result).toContain('<span class="hljs-number">42</span>');
});

test("lean highlights char literals but not primes in identifiers", () => {
  const result = highlight(
    "theorem add_zero' (n : Nat) : n + 0 = n := rfl\nexample : 'c' = '\\n' := rfl",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">add_zero&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-string">&#x27;c&#x27;</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;\\n&#x27;</span>');
  expect(result).not.toContain('<span class="hljs-string">&#x27; (n');
});

test("lean highlights guillemet-quoted declaration names", () => {
  const result = highlight("private def «weird name» : Bool := true");

  expect(result).toContain(
    '<span class="hljs-title function_">«weird name»</span>',
  );
});
