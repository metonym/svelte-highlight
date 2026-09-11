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

test("haproxy highlights hyphenated and dotted directives as whole tokens", () => {
  const result = highlight(
    "frontend fe\n    http-request set-header X-Real-IP %[src]\n    stick-table type ip size 100k\n    default-server inter 2s\n    acl h req.hdr(host) -i x\n    server s1 10.0.0.1:80 send-proxy",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">http-request</span> <span class="hljs-keyword">set-header</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">stick-table</span>');
  expect(result).toContain('<span class="hljs-keyword">default-server</span>');
  expect(result).toContain('<span class="hljs-built_in">req.hdr</span>(host)');
  expect(result).toContain('<span class="hljs-attr">send-proxy</span>');
  expect(result).not.toContain('<span class="hljs-keyword">stick</span>-');
});

test("haproxy does not style the line after a nameless section as its name", () => {
  const result = highlight(
    "global\n    log /dev/log local0\ndefaults # x\n    mode http",
  );

  expect(result).toContain(
    '<span class="hljs-section">global</span>\n    <span class="hljs-keyword">log</span> /dev/log local0',
  );
  expect(result).toContain(
    '<span class="hljs-section">defaults</span> <span class="hljs-comment"># x</span>',
  );
  expect(result).not.toContain("hljs-title class_");
});

test("haproxy highlights conditional block directives and env vars", () => {
  const result = highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: HAProxy's own ${} env-var syntax, not a JS template literal
    'global\n    .if defined(ENABLE_H3)\n    .notice "h3"\n    .endif\n    setenv PORT 80\nbackend b\n    server s1 10.0.0.1:${PORT} check',
  );

  expect(result).toContain(
    '<span class="hljs-meta">.if</span> defined(ENABLE_H3)',
  );
  expect(result).toContain('<span class="hljs-meta">.notice</span>');
  expect(result).toContain('<span class="hljs-meta">.endif</span>');
  expect(result).toContain('<span class="hljs-keyword">setenv</span>');
  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: HAProxy's own ${} env-var syntax, not a JS template literal
    '<span class="hljs-variable">${PORT}</span>',
  );
});

test("haproxy keeps units with numbers and dots out of them", () => {
  const result = highlight(
    "defaults\n    timeout connect 5s\n    maxconn 100k\n    errorfile 503 /etc/errors/503.http\n    http-check expect status 200-399",
  );

  expect(result).toContain('<span class="hljs-number">5s</span>');
  expect(result).toContain('<span class="hljs-number">100k</span>');
  expect(result).toContain('<span class="hljs-number">503</span> /etc/errors/');
  expect(result).toContain(
    '<span class="hljs-number">200</span>-<span class="hljs-number">399</span>',
  );
});

test("haproxy highlights newer sections and keeps a plain word after one unstyled", () => {
  const result = highlight(
    "crt-store web\n    load crt site.pem\nlog-forward syslog\n    bind :1514\n",
  );

  expect(result).toContain(
    '<span class="hljs-section">crt-store</span> <span class="hljs-title class_">web</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">load</span> <span class="hljs-attr">crt</span> site.pem',
  );
  expect(result).toContain(
    '<span class="hljs-section">log-forward</span> <span class="hljs-title class_">syslog</span>',
  );
});
