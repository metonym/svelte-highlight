import { createRegistry } from "../src/engine.js";

import spade from "../src/languages/spade";

const registry = createRegistry();

registry.register(spade.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "spade" }).value;

test("spade highlights entity/fn/pipeline as keywords", () => {
  const result = highlight("entity blinky(clk: clock) -> bool {}");

  expect(result).toContain('<span class="hljs-keyword">entity</span>');
});

test("spade highlights the reg(clk) binder", () => {
  const result = highlight("reg(clk) count: uint<28> = 0;");

  expect(result).toContain('<span class="hljs-keyword">reg</span>(clk)');
});

test("spade highlights the reset(...) clause", () => {
  const result = highlight("reg(clk) count reset(rst: 0) = 0;");

  expect(result).toContain(
    '<span class="hljs-keyword">reset</span>(rst: <span class="hljs-number">0</span>)',
  );
});

test("spade highlights generic types like uint<N>", () => {
  const result = highlight("uint<28>");

  expect(result).toContain('<span class="hljs-type">uint&lt;28&gt;</span>');
});

test("spade highlights numeric literals with underscore separators", () => {
  const result = highlight("let duration = 100_000_000;");

  expect(result).toContain('<span class="hljs-number">100_000_000</span>');
});

test("spade highlights the -> return arrow", () => {
  const result = highlight("fn add(a: int) -> int { a }");

  expect(result).toContain('<span class="hljs-punctuation">-&gt;</span>');
});

test("spade does not treat VHDL's `is`/`port`/`end` as keywords", () => {
  const result = highlight(
    "entity foo is\nport(clk: in std_logic);\nend entity;",
  );

  expect(result).not.toContain('<span class="hljs-keyword">is</span>');
  expect(result).not.toContain('<span class="hljs-keyword">port</span>');
  expect(result).not.toContain('<span class="hljs-keyword">end</span>');
});
