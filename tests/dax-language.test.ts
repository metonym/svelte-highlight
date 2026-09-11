import { createRegistry } from "../src/engine.js";

import dax from "../src/languages/dax";

const registry = createRegistry();

registry.register(dax.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dax" }).value;

test("dax highlights function calls", () => {
  const result = highlight("Total Sales = CALCULATE(SUM(Sales[Amount]))");

  expect(result).toContain('<span class="hljs-built_in">CALCULATE</span>');
  expect(result).toContain('<span class="hljs-built_in">SUM</span>');
});

test("dax highlights table and column references", () => {
  const result = highlight("'Sales'[Amount]");

  expect(result).toContain(
    '<span class="hljs-symbol">&#x27;Sales&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-variable">[Amount]</span>');
});

test("dax highlights unquoted table references", () => {
  const result = highlight("Sales[Amount]");

  expect(result).toContain('<span class="hljs-symbol">Sales</span>');
  expect(result).toContain('<span class="hljs-variable">[Amount]</span>');
});

test("dax highlights VAR and RETURN keywords", () => {
  const result = highlight('VAR CurrentRegion = "West"\nRETURN CurrentRegion');

  expect(result).toContain('<span class="hljs-keyword">VAR</span>');
  expect(result).toContain('<span class="hljs-keyword">RETURN</span>');
});

test("dax highlights line comments with //", () => {
  const result = highlight("// a comment\nResult = 1");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
});

test("dax highlights line comments with --", () => {
  const result = highlight("-- a comment\nResult = 1");

  expect(result).toContain('<span class="hljs-comment">-- a comment</span>');
});

test("dax highlights block comments", () => {
  const result = highlight("/* a comment */\nResult = 1");

  expect(result).toContain('<span class="hljs-comment">/* a comment */</span>');
});

test("dax highlights strings with escaped quotes and numbers", () => {
  const result = highlight('Quote = "She said ""hi"""');

  expect(result).toContain(
    '<span class="hljs-string">&quot;She said &quot;&quot;hi&quot;&quot;&quot;</span>',
  );
});

test("dax highlights numbers and literals", () => {
  const result = highlight("IsPositive = IF(Sales[Amount] > 0, TRUE, FALSE)");

  expect(result).toContain('<span class="hljs-number">0</span>');
  expect(result).toContain('<span class="hljs-literal">TRUE</span>');
  expect(result).toContain('<span class="hljs-literal">FALSE</span>');
});

test("dax styles a bare quoted table name as a symbol, not a function", () => {
  const result = highlight("Rank = RANKX ( ALL ( 'Product' ), [Total Sales] )");

  expect(result).toContain(
    '<span class="hljs-symbol">&#x27;Product&#x27;</span>',
  );
  expect(result).not.toContain('<span class="hljs-built_in">Product</span>');
  // The column-qualified form is unchanged.
  expect(highlight("'Date'[Year]")).toContain(
    '<span class="hljs-symbol">&#x27;Date&#x27;</span><span class="hljs-variable">[Year]</span>',
  );
});

test("dax highlights window functions, dotted functions, and dt literals", () => {
  const result = highlight(
    "Win = WINDOW ( 1, ABS, 1, REL, ORDERBY ( 'Date'[Date], ASC BLANKS LAST ), PARTITIONBY ( 'Product'[Color] ) )\nP = PERCENTILE.INC ( Sales[Amount], 0.9 ) + INFO.MEASURES () + ROW ( \"x\", 1 )\nD = dt\"2024-01-31\"",
  );

  expect(result).toContain('<span class="hljs-built_in">WINDOW</span>');
  expect(result).toContain('<span class="hljs-built_in">ORDERBY</span>');
  expect(result).toContain('<span class="hljs-built_in">PARTITIONBY</span>');
  expect(result).toContain('<span class="hljs-keyword">REL</span>');
  expect(result).toContain('<span class="hljs-keyword">BLANKS</span>');
  expect(result).toContain('<span class="hljs-built_in">PERCENTILE.INC</span>');
  expect(result).toContain('<span class="hljs-built_in">INFO.MEASURES</span>');
  expect(result).toContain('<span class="hljs-built_in">ROW</span>');
  expect(result).toContain(
    '<span class="hljs-string">dt&quot;2024-01-31&quot;</span>',
  );
});
