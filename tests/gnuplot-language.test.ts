import { createRegistry } from "../src/engine.js";

import gnuplot from "../src/languages/gnuplot";

const registry = createRegistry();

registry.register(gnuplot.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "gnuplot" }).value;

test("gnuplot highlights plot/splot command keywords and a quoted data source", () => {
  const result = highlight("plot 'data.dat' using 1:2 with lines");

  expect(result).toContain('<span class="hljs-keyword">plot</span>');
  expect(result).toContain(
    '<span class="hljs-string">&#x27;data.dat&#x27;</span>',
  );
});

test("gnuplot highlights set followed by a recognized option as attr", () => {
  const result = highlight('set xlabel "time"');

  expect(result).toContain('<span class="hljs-keyword">set</span>');
  expect(result).toContain('<span class="hljs-attr">xlabel</span>');
  expect(result).toContain('<span class="hljs-string">&quot;time&quot;</span>');
});

test("gnuplot highlights built-in math functions", () => {
  const result = highlight("y = sin(x) * 2.0");

  expect(result).toContain('<span class="hljs-built_in">sin</span>');
  expect(result).toContain('<span class="hljs-number">2.0</span>');
});

test("gnuplot highlights hash comments", () => {
  const result = highlight("# a comment\nplot x");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});

test("gnuplot highlights macro expansion and datablock identifiers", () => {
  const result = highlight("plot @MACRO\n$Data << EOD");

  expect(result).toContain('<span class="hljs-variable">@MACRO</span>');
  expect(result).toContain('<span class="hljs-variable">$Data</span>');
});

test("gnuplot does not tag an unrecognized set target as attr", () => {
  const result = highlight("set x 1");

  expect(result).toContain('<span class="hljs-keyword">set</span>');
  expect(result).not.toContain('<span class="hljs-attr">x</span>');
});
