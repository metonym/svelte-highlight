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
