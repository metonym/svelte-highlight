import hljs from "highlight.js/lib/core";
import dax from "../src/languages/dax";

hljs.registerLanguage(dax.name, dax.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "dax" }).value;

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
