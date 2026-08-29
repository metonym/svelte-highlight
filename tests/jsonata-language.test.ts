import { createRegistry } from "../src/engine.js";

import jsonata from "../src/languages/jsonata";

const registry = createRegistry();

registry.register(jsonata.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "jsonata" }).value;

test("jsonata highlights built-in functions", () => {
  const result = highlight("$sum(Account.Order.Product.(Price * Quantity))");

  expect(result).toContain('<span class="hljs-built_in">$sum</span>');
});

test("jsonata highlights backtick-quoted field names", () => {
  const result = highlight("Account.`Order Item`.Description");

  expect(result).toContain('<span class="hljs-property">`Order Item`</span>');
});

test("jsonata highlights variables distinctly from built-ins", () => {
  const result = highlight("$map(Account.Order, function($o) { $o.Price })");

  expect(result).toContain('<span class="hljs-built_in">$map</span>');
  expect(result).toContain('<span class="hljs-variable">$o</span>');
});

test("jsonata highlights block comments and keywords", () => {
  const result = highlight("/* double it */\nfunction($x) { $x * 2 }");

  expect(result).toContain('<span class="hljs-comment">/* double it */</span>');
  expect(result).toContain('<span class="hljs-keyword">function</span>');
});
