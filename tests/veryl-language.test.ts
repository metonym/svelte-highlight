import { createRegistry } from "../src/engine.js";

import veryl from "../src/languages/veryl";

const registry = createRegistry();

registry.register(veryl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "veryl" }).value;

test("veryl highlights module/pub as keywords", () => {
  const result = highlight("pub module Foo {}");

  expect(result).toContain('<span class="hljs-keyword">pub</span>');
  expect(result).toContain('<span class="hljs-keyword">module</span>');
});

test("veryl highlights colon-typed ports as attr", () => {
  const result = highlight("i_clk: input clock,");

  expect(result).toContain('<span class="hljs-attr">i_clk</span>');
  expect(result).toContain('<span class="hljs-type">clock</span>');
});

test("veryl highlights always_ff/if_reset", () => {
  const result = highlight(
    "always_ff {\n  if_reset {\n    r_data = 0;\n  }\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">always_ff</span>');
  expect(result).toContain('<span class="hljs-keyword">if_reset</span>');
});

test("veryl highlights generic parameter blocks", () => {
  const result = highlight("#(\n    param Width: u32 = 8,\n)");

  expect(result).toContain('<span class="hljs-punctuation">#(');
  expect(result).toContain('<span class="hljs-type">u32</span>');
});

test("veryl highlights the assign keyword", () => {
  const result = highlight("assign o_data = r_data;");

  expect(result).toContain('<span class="hljs-keyword">assign</span>');
});

test("veryl highlights the -> and :: operators", () => {
  const result = highlight("function add::<W: u32>() -> logic<W> {}");

  expect(result).toContain('<span class="hljs-operator">::&lt;</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("veryl does not treat a ternary's true-branch identifier as a typed port", () => {
  const result = highlight("assign x = cond ? y : z;");

  expect(result).not.toContain('<span class="hljs-attr">y</span>');
});
