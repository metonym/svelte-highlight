import { createRegistry } from "../src/engine.js";

import jmespath from "../src/languages/jmespath";

const registry = createRegistry();

registry.register(jmespath.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "jmespath" }).value;

test("jmespath highlights built-in functions", () => {
  const result = highlight("sort_by(people, &age)");

  expect(result).toContain('<span class="hljs-built_in">sort_by</span>');
});

test("jmespath highlights the current-node reference and expression-ref operator", () => {
  const result = highlight("sort_by(@, &name)");

  expect(result).toContain('<span class="hljs-variable">@</span>');
  expect(result).toContain('<span class="hljs-operator">&amp;</span>');
});

test("jmespath highlights backtick JSON literals distinctly from raw strings", () => {
  const result = highlight("age > `30` && name == 'Ada'");

  expect(result).toContain('<span class="hljs-string">`30`</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;Ada&#x27;</span>');
});

test("jmespath highlights bracketed filter expressions as a property span", () => {
  const result = highlight("people[?age > `30`].name");

  expect(result).toContain('<span class="hljs-property">[?age &gt; ');
  expect(result).toContain('<span class="hljs-property">.name</span>');
});
