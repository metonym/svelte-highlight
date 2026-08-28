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
