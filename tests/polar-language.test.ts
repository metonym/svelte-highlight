import { createRegistry } from "../src/engine.js";

import polar from "../src/languages/polar";

const registry = createRegistry();

registry.register(polar.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "polar" }).value;

test("polar highlights allow rules and resource blocks", () => {
  const result = highlight(
    `resource Document {
  permissions = ["read", "write"];
}

allow(actor: User, "read", resource: Document) if
  has_permission(actor, "read", resource);
`,
  );

  expect(result).toContain('<span class="hljs-keyword">resource</span>');
  expect(result).toContain('<span class="hljs-keyword">allow</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">has_permission</span>');
  expect(result).toContain('<span class="hljs-title class_">Document</span>');
});

test("polar highlights comments and strings", () => {
  const result = highlight('# policy\nallow(user, "read", doc);');

  expect(result).toContain('<span class="hljs-comment"># policy</span>');
  expect(result).toContain('<span class="hljs-string">&quot;read&quot;</span>');
});

test("polar highlights nested resource relations", () => {
  const result = highlight(
    `resource Repository {
  relations = { parent: Organization };
  "read" if "member";
}
`,
  );

  expect(result).toContain('<span class="hljs-keyword">resource</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">Organization</span>',
  );
});

test("polar highlights resource fields and iff tests", () => {
  const result = highlight(
    'resource Repository {\n  permissions = ["read"];\n  roles = ["member"];\n  relations = { parent: Organization };\n}\n\ntest "access" {\n  setup { has_role(User{"a"}, "member", Repository{"r"}); }\n  assert allow(User{"a"}, action: String, Repository{"r"}) iff action in ["read"];\n  assert_not allow(User{"b"}, "push", Repository{"r"});\n}',
  );

  expect(result).toContain('<span class="hljs-keyword">permissions</span>');
  expect(result).toContain('<span class="hljs-keyword">roles</span>');
  expect(result).toContain('<span class="hljs-keyword">relations</span>');
  expect(result).toContain('<span class="hljs-keyword">test</span>');
  expect(result).toContain('<span class="hljs-keyword">setup</span>');
  expect(result).toContain('<span class="hljs-keyword">assert</span>');
  expect(result).toContain('<span class="hljs-keyword">iff</span>');
  expect(result).toContain('<span class="hljs-keyword">assert_not</span>');
});

test("polar still highlights allow and does not treat on as a keyword", () => {
  const result = highlight(
    'allow(actor: User, "read", resource: Document) if has_permission(actor, "read", resource);\n"maintainer" if "owner" on "parent";',
  );

  expect(result).toContain('<span class="hljs-keyword">allow</span>');
  expect(result).not.toContain('<span class="hljs-keyword">on</span>');
});
