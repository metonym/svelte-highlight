import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";

import fluent from "../src/languages/fluent";

const registry = createRegistry();

registry.register(fluent.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "fluent" }).value;

test("fluent highlights messages, terms, and attributes", () => {
  const result = highlight(
    "-brand-name = Firefox\n    .gender = masculine\nabout = About Firefox\n    .title = About",
  );

  expect(result).toContain('<span class="hljs-title">-brand-name</span>');
  expect(result).toContain('<span class="hljs-title">about</span>');
  expect(result).toContain('<span class="hljs-attr">.gender</span>');
  expect(result).toContain('<span class="hljs-attr">.title</span>');
  expect(result).toContain('<span class="hljs-operator">=</span> Firefox');
});

test("fluent highlights placeables", () => {
  const result = highlight(
    'a = Hi { $user }, see { -brand-name } and { menu.title } {"\\u00A0"}',
  );

  expect(result).toContain(
    '<span class="hljs-subst">{ <span class="hljs-variable">$user</span> }</span>',
  );
  expect(result).toContain(
    '<span class="hljs-subst">{ <span class="hljs-title">-brand-name</span> }</span>',
  );
  expect(result).toContain(
    '<span class="hljs-title">menu</span><span class="hljs-attr">.title</span>',
  );
  expect(result).toContain('<span class="hljs-char escape_">\\u00A0</span>');
});

test("fluent highlights select expressions and variants", () => {
  const result = highlight(
    "emails =\n    { $count ->\n        [one] One email.\n       *[other] { $count } emails.\n    }",
  );

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-symbol">[one]</span> One email.');
  expect(result).toContain(
    '<span class="hljs-operator">*</span><span class="hljs-symbol">[other]</span>',
  );
  expect(result).not.toContain('<span class="hljs-title">emails.</span>');
});

test("fluent highlights function calls and named arguments", () => {
  const result = highlight(
    'n = { NUMBER($ratio, minimumFractionDigits: 2) } { DATETIME($d, month: "long") }',
  );

  expect(result).toContain('<span class="hljs-built_in">NUMBER</span>');
  expect(result).toContain('<span class="hljs-built_in">DATETIME</span>');
  expect(result).toContain(
    '<span class="hljs-attr">minimumFractionDigits</span>: <span class="hljs-number">2</span>',
  );
  expect(result).toContain('<span class="hljs-string">&quot;long&quot;</span>');
});

test("fluent highlights all three comment levels", () => {
  const result = highlight("### Resource\n## Group\n# Message\nhi = Hi");

  expect(result).toContain('<span class="hljs-comment">### Resource</span>');
  expect(result).toContain('<span class="hljs-comment">## Group</span>');
  expect(result).toContain('<span class="hljs-comment"># Message</span>');
});

test("fluent resolves the ftl alias", () => {
  expect(resolveLanguageName("ftl")).toBe("fluent");
});
