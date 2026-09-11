import { createRegistry } from "../src/engine.js";

import cedar from "../src/languages/cedar";

const registry = createRegistry();

registry.register(cedar.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cedar" }).value;

test("cedar highlights permit/forbid and when/unless", () => {
  const result = highlight(
    `permit (
  principal == User::"alice",
  action == Action::"viewPhoto",
  resource
)
when { resource.owner == principal };
`,
  );

  expect(result).toContain('<span class="hljs-keyword">permit</span>');
  expect(result).toContain('<span class="hljs-keyword">principal</span>');
  expect(result).toContain('<span class="hljs-keyword">action</span>');
  expect(result).toContain('<span class="hljs-keyword">resource</span>');
  expect(result).toContain('<span class="hljs-keyword">when</span>');
  expect(result).toContain('<span class="hljs-title class_">User::</span>');
});

test("cedar highlights comments and strings", () => {
  const result = highlight(
    "// deny guests\nforbid (principal, action, resource);",
  );

  expect(result).toContain('<span class="hljs-comment">// deny guests</span>');
  expect(result).toContain('<span class="hljs-keyword">forbid</span>');
});

test("cedar highlights nested when conditions", () => {
  const result = highlight(
    `permit (principal, action, resource)
unless { context.mfa == false };
`,
  );

  expect(result).toContain('<span class="hljs-keyword">unless</span>');
  expect(result).toContain('<span class="hljs-keyword">context</span>');
  expect(result).toContain('<span class="hljs-literal">false</span>');
});

test("cedar highlights entity UIDs inside sets and template slots", () => {
  const result = highlight(
    'permit (principal is User in ?principal, action, resource) when { principal in [User::"alice", User::"bob"] };',
  );

  expect(result).toContain('<span class="hljs-variable">?principal</span>');
  expect(result).toContain('<span class="hljs-title class_">User::</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;alice&quot;</span>',
  );
});

test("cedar highlights datetime/ip constructors and ?? without restyling permit", () => {
  const result = highlight(
    'permit (principal, action, resource) when { ip(context.ip) && datetime("2026-01-01T00:00:00Z") && context.dept ?? "eng" };',
  );

  expect(result).toContain('<span class="hljs-built_in">ip</span>');
  expect(result).toContain('<span class="hljs-built_in">datetime</span>');
  expect(result).toContain('<span class="hljs-operator">&amp;&amp;</span>');
  expect(result).toContain('<span class="hljs-operator">??</span>');
  expect(result).toContain('<span class="hljs-keyword">permit</span>');
});

test("cedar does not treat ip as a builtin except as a call", () => {
  const result = highlight('when { context.ip == ip("10.0.0.1") };');

  expect(result).toContain('<span class="hljs-built_in">ip</span>(');
  expect(result).not.toContain(
    '<span class="hljs-keyword">context</span>.<span class="hljs-built_in">ip</span>',
  );
});
