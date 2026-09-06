import { createRegistry } from "../src/engine.js";

import haproxy from "../src/languages/haproxy";

const registry = createRegistry();

registry.register(haproxy.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "haproxy" }).value;

test("haproxy highlights section headers with their name", () => {
  const result = highlight("frontend web\n    bind *:80");

  expect(result).toContain('<span class="hljs-section">frontend</span>');
  expect(result).toContain('<span class="hljs-title class_">web</span>');
});

test("haproxy highlights directives as keywords", () => {
  const result = highlight("    balance roundrobin");

  expect(result).toContain('<span class="hljs-keyword">balance</span>');
});

test("haproxy highlights ACL fetches as built-ins", () => {
  const result = highlight("    acl is_api path_beg /api");

  expect(result).toContain('<span class="hljs-built_in">path_beg</span>');
});

test("haproxy highlights server attributes", () => {
  const result = highlight("    server web1 10.0.0.1:8080 check inter 2s");

  expect(result).toContain('<span class="hljs-attr">check</span>');
});

test("haproxy highlights comments and strings", () => {
  const result = highlight('# comment\nerrorfile 503 "/etc/errors/503.http"');

  expect(result).toContain('<span class="hljs-comment"># comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;/etc/errors/503.http&quot;</span>',
  );
});

test("haproxy highlights log-format sample fetch variables", () => {
  const result = highlight("log-format %ci:%cp");

  expect(result).toContain('<span class="hljs-template-variable">%ci</span>');
});
