import { createRegistry } from "../src/engine.js";

import bsv from "../src/languages/bsv";

const registry = createRegistry();

registry.register(bsv.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bsv" }).value;

test("bsv highlights rule/endrule as keywords", () => {
  const result = highlight("rule swap (n > m);\nendrule");

  expect(result).toContain('<span class="hljs-keyword">rule</span>');
  expect(result).toContain('<span class="hljs-keyword">endrule</span>');
});

test("bsv highlights the <- bind operator", () => {
  const result = highlight("Reg#(Bit#(32)) n <- mkRegU;");

  expect(result).toContain('<span class="hljs-operator">&lt;-</span>');
});

test("bsv highlights parameterized types with nested generics", () => {
  const result = highlight("Reg#(Bit#(32)) n <- mkRegU;");

  expect(result).toContain('<span class="hljs-type">Reg#(');
  expect(result).toContain(
    '<span class="hljs-type">Bit#(<span class="hljs-number">32</span>)</span>',
  );
});

test("bsv highlights mk-prefixed constructors as built-ins", () => {
  const result = highlight("Reg#(Bit#(32)) n <- mkRegU;");

  expect(result).toContain('<span class="hljs-built_in">mkRegU</span>');
});

test("bsv highlights sized numeric literals", () => {
  const result = highlight("Bit#(8) x = 8'hFF;");

  expect(result).toContain('<span class="hljs-number">8&#x27;hFF</span>');
});

test("bsv highlights action/endaction and method/endmethod", () => {
  const result = highlight(
    "method Action start(Bit#(32) n) if (m == 0);\naction\nn <= n;\nendaction\nendmethod",
  );

  expect(result).toContain('<span class="hljs-keyword">action</span>');
  expect(result).toContain('<span class="hljs-keyword">endaction</span>');
  expect(result).toContain('<span class="hljs-keyword">endmethod</span>');
});

test("bsv does not treat Verilog's `wire` as a keyword", () => {
  const result = highlight("wire foo;");

  expect(result).not.toContain('<span class="hljs-keyword">wire</span>');
});
