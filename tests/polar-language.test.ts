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
