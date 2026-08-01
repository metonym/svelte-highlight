import { createRegistry } from "../src/engine.js";

import prql from "../src/languages/prql";

const registry = createRegistry();

registry.register(prql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "prql" }).value;

test("prql highlights transform keywords and the pipe operator", () => {
  const result = highlight(
    'from employees\nfilter department == "Sales"\nselect [name, salary]',
  );

  expect(result).toContain('<span class="hljs-keyword">from</span>');
  expect(result).toContain('<span class="hljs-keyword">filter</span>');
  expect(result).toContain('<span class="hljs-keyword">select</span>');
  expect(result).toContain('<span class="hljs-operator">==</span>');
});

test("prql highlights aggregate functions", () => {
  const result = highlight(
    "group [title] (\n  aggregate [\n    average salary,\n    ct = count this,\n  ]\n)",
  );

  expect(result).toContain('<span class="hljs-keyword">group</span>');
  expect(result).toContain('<span class="hljs-keyword">aggregate</span>');
  expect(result).toContain('<span class="hljs-built_in">average</span>');
  expect(result).toContain('<span class="hljs-built_in">count</span>');
});

test("prql highlights column assignments", () => {
  const result = highlight("derive gross_salary = salary + payroll_tax");

  expect(result).toContain('<span class="hljs-keyword">derive</span>');
  expect(result).toContain('<span class="hljs-attr">gross_salary</span>');
});

test("prql highlights range and take", () => {
  const result = highlight("take 1..20");

  expect(result).toContain('<span class="hljs-keyword">take</span>');
  expect(result).toContain('<span class="hljs-operator">..</span>');
});

test("prql highlights f-strings and s-strings", () => {
  const fString = highlight('derive greeting = f"Hello, {name}!"');
  const sString = highlight('from s"SELECT * FROM employees"');

  expect(fString).toContain('<span class="hljs-string">f&quot;Hello, ');
  expect(fString).toContain(
    '<span class="hljs-subst">{<span class="hljs-variable">name</span>}</span>',
  );
  expect(sString).toContain(
    '<span class="hljs-string">s&quot;SELECT * FROM employees&quot;</span>',
  );
});

test("prql highlights date literals", () => {
  const result = highlight("filter dob > @1990-01-01");

  expect(result).toContain('<span class="hljs-meta">@1990-01-01</span>');
});

test("prql highlights line comments", () => {
  const result = highlight("# a comment\nfrom employees");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});

test("prql highlights numbers with underscores", () => {
  const result = highlight("take 1_000_000");

  expect(result).toContain('<span class="hljs-number">1_000_000</span>');
});
