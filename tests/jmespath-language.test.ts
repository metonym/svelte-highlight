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

  expect(result).toContain(
    '<span class="hljs-property">[?age <span class="hljs-operator">&gt;</span> ',
  );
  expect(result).toContain('<span class="hljs-property">.name</span>');
});

test("jmespath highlights functions and operators inside filter expressions", () => {
  const result = highlight(
    "people[?age > `30` && contains(name, 'a') || !flag].name",
  );

  expect(result).toContain(
    '<span class="hljs-property">[?age <span class="hljs-operator">&gt;</span> <span class="hljs-string">`30`</span> <span class="hljs-operator">&amp;</span><span class="hljs-operator">&amp;</span> <span class="hljs-built_in">contains</span>(name, <span class="hljs-string">&#x27;a&#x27;</span>) <span class="hljs-operator">||</span> <span class="hljs-operator">!</span>flag]</span>',
  );
});

test("jmespath highlights top-level comparators and leaves index brackets alone", () => {
  const result = highlight("a.b == `1` | [0:2] | items[?x != y]");

  expect(result).toContain('<span class="hljs-operator">==</span>');
  expect(result).toContain(
    '<span class="hljs-property">[<span class="hljs-number">0</span>:<span class="hljs-number">2</span>]</span>',
  );
  expect(result).toContain('<span class="hljs-operator">!=</span>');
});
