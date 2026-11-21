import { createRegistry } from "../src/engine.js";

import uiua from "../src/languages/uiua";

const registry = createRegistry();

registry.register(uiua.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "uiua" }).value;

test("uiua highlights the binding arrow as the relevance carrier", () => {
  const result = highlight("Double ← ×2");

  expect(result).toContain('<span class="hljs-operator">←</span>');
  expect(result).toContain('<span class="hljs-title function_">Double</span>');
});

test("uiua highlights stack glyphs as built-ins", () => {
  const result = highlight("/+ ≡Double [1 2 3 4]");

  expect(result).toContain('<span class="hljs-built_in">/</span>');
  expect(result).toContain('<span class="hljs-built_in">≡</span>');
});

test("uiua highlights ASCII-spelled primitives", () => {
  const result = highlight("dup flip over");

  expect(result).toContain('<span class="hljs-built_in">dup</span>');
});

test("uiua highlights format strings and comments", () => {
  const result = highlight('# a comment\n&p $"Total: _" Total');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-string">');
});

test("uiua highlights numbers", () => {
  const result = highlight("×2");

  expect(result).toContain('<span class="hljs-number">2</span>');
});

test("uiua highlights newer modifier glyphs", () => {
  const result = highlight(
    "⤙⊂ 1 2\n⤚⊂ 1 2\n◠+ 1 2\n◡+ 1 2\n⌅(+1|-1) 3\n⨬(+1|×2) 0 5\n⧈/+ [1 2 3]\n˙⊞= ⇡3\n⌝⊂ 1 [1 2]\n⧋⊂ 1 2\nₑ1\n⚇ 1 [1 2 1]\n⧆ [1 2 1]\n⨪4",
  );

  for (const glyph of [
    "⤙",
    "⤚",
    "◠",
    "◡",
    "⌅",
    "⨬",
    "⧈",
    "˙",
    "⌝",
    "⧋",
    "ₑ",
    "⚇",
    "⧆",
    "⨪",
  ]) {
    expect(result).toContain(`<span class="hljs-built_in">${glyph}</span>`);
  }
});

test("uiua highlights core glyphs the grammar used to miss", () => {
  const result = highlight("□ ∩ ↥ ↧ ⊟ ⍣ △ ▽ ☇ ⍚ ⦷ ◴ ◰ ◇ ⤸ ⊥ - 1");

  for (const glyph of [
    "□",
    "∩",
    "↥",
    "↧",
    "⊟",
    "⍣",
    "△",
    "▽",
    "☇",
    "⍚",
    "⦷",
    "◴",
    "◰",
    "◇",
    "⤸",
    "⊥",
    "-",
  ]) {
    expect(result).toContain(`<span class="hljs-built_in">${glyph}</span>`);
  }
});

test("uiua reads ¯ as the negative sign and - as subtract", () => {
  const result = highlight("¯5 1.5e¯3\n-1 3");

  expect(result).toContain('<span class="hljs-number">¯5</span>');
  expect(result).toContain('<span class="hljs-number">1.5e¯3</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">-</span><span class="hljs-number">1</span>',
  );
  expect(result).not.toContain('<span class="hljs-number">-1</span>');
});

test("uiua highlights both numbers in a strand", () => {
  const result = highlight("[1_2 3_4]");

  expect(result).toContain(
    '<span class="hljs-number">1</span><span class="hljs-operator">_</span><span class="hljs-number">2</span>',
  );
});

test("uiua keeps a numeric subscript with its glyph", () => {
  const result = highlight("⊟₃ 1 2 3");

  expect(result).toContain('<span class="hljs-built_in">⊟₃</span>');
});

test("uiua highlights system functions", () => {
  const result = highlight('&fras "data.txt"');

  expect(result).toContain('<span class="hljs-built_in">&amp;fras</span>');
});

test("uiua marks test scope lines but not dashes inside code", () => {
  const result = highlight("---\n⍤⤙≍ 3 +1 2\n---\n- 1 2");

  expect(result).toContain('<span class="hljs-meta">---</span>');
  expect(result).not.toContain('<span class="hljs-meta">- 1 2</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">-</span> <span class="hljs-number">1</span>',
  );
});
