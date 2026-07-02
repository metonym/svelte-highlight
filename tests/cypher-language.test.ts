import hljs from "highlight.js/lib/core";
import cypher from "../src/languages/cypher";

hljs.registerLanguage(cypher.name, cypher.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "cypher" }).value;

test("cypher highlights clause keywords", () => {
  const result = highlight("MATCH (n) RETURN n");

  expect(result).toContain('<span class="hljs-keyword">MATCH</span>');
  expect(result).toContain('<span class="hljs-keyword">RETURN</span>');
});

test("cypher is case-insensitive for keywords", () => {
  const result = highlight("match (n) where n.x = 1 return n");

  expect(result).toContain('<span class="hljs-keyword">match</span>');
  expect(result).toContain('<span class="hljs-keyword">where</span>');
});

test("cypher highlights node labels", () => {
  const result = highlight("MATCH (n:Person) RETURN n");

  expect(result).toContain('<span class="hljs-type">:Person</span>');
});

test("cypher highlights parameters and strings", () => {
  const result = highlight('MATCH (n) WHERE n.name = $name RETURN "ok"');

  expect(result).toContain('<span class="hljs-variable">$name</span>');
  expect(result).toContain('<span class="hljs-string">&quot;ok&quot;</span>');
});

test("cypher highlights built-in function calls", () => {
  const result = highlight(
    "MATCH (n) RETURN id(n), labels(n), coalesce(n.a, n.b)",
  );

  expect(result).toContain('<span class="hljs-built_in">id</span>');
  expect(result).toContain('<span class="hljs-built_in">labels</span>');
  expect(result).toContain('<span class="hljs-built_in">coalesce</span>');
});

test("cypher highlights backtick-quoted identifiers", () => {
  const result = highlight("MATCH (n:`weird label`) RETURN n.`property name`");

  expect(result).toContain('<span class="hljs-string">`weird label`</span>');
  expect(result).toContain('<span class="hljs-string">`property name`</span>');
});
