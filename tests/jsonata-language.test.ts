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

test("jsonata highlights encodeUrlComponent and chaining operators", () => {
  const result = highlight('$encodeUrlComponent("x") ~> $count := Price ?? 0');

  expect(result).toContain(
    '<span class="hljs-built_in">$encodeUrlComponent</span>',
  );
  expect(result).toContain('<span class="hljs-operator">~&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">:=</span>');
  expect(result).toContain('<span class="hljs-operator">??</span>');
});

test("jsonata does not wrap filter predicates as a single property", () => {
  const result = highlight('Account.Order[Status = "active"]');

  expect(result).not.toContain('hljs-property">[Status');
  expect(result).toContain(
    '<span class="hljs-string">&quot;active&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-property">.Order</span>');
});

test("jsonata highlights $$ as one variable and still styles $sum", () => {
  const root = highlight("$$.Account");
  const sum = highlight("$sum(x)");

  expect(root).toContain('<span class="hljs-variable">$$</span>');
  expect(root).not.toContain(
    '<span class="hljs-variable">$</span><span class="hljs-variable">$</span>',
  );
  expect(sum).toContain('<span class="hljs-built_in">$sum</span>');
});
