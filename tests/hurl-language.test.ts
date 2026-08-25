import { createRegistry } from "../src/engine.js";

import hurl from "../src/languages/hurl";

const registry = createRegistry();

registry.register(hurl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "hurl" }).value;

const SEED = `# list users
GET https://example.org/api/users
HTTP 200
[Asserts]
jsonpath "$.id" == 1
header "Content-Type" contains "json"
`;

test("hurl highlights methods, status lines, and assert sections", () => {
  const result = highlight(SEED);

  expect(result).toContain('<span class="hljs-keyword">GET</span>');
  expect(result).toContain('<span class="hljs-keyword">HTTP</span>');
  expect(result).toContain('<span class="hljs-number">200</span>');
  expect(result).toContain('<span class="hljs-section">[Asserts]</span>');
  expect(result).toContain('<span class="hljs-built_in">jsonpath</span>');
  expect(result).toContain('<span class="hljs-built_in">header</span>');
  expect(result).toContain('<span class="hljs-built_in">contains</span>');
});

test("hurl highlights comments and strings", () => {
  const result = highlight(
    '# list users\nGET https://example.org/api/users\nHTTP 200\n[Asserts]\nheader "Content-Type" contains "json"\n',
  );

  expect(result).toContain('<span class="hljs-comment"># list users</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;Content-Type&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-string">&quot;json&quot;</span>');
});

test("hurl highlights nested headers section and urls", () => {
  const result = highlight(
    `POST https://example.org/api/users
[Headers]
Content-Type: application/json
HTTP 201
`,
  );

  expect(result).toContain('<span class="hljs-keyword">POST</span>');
  expect(result).toContain('<span class="hljs-section">[Headers]</span>');
  expect(result).toContain(
    '<span class="hljs-string">https://example.org/api/users</span>',
  );
});
