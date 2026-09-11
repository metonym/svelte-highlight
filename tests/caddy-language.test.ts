import { createRegistry } from "../src/engine.js";

import caddy from "../src/languages/caddy";

const registry = createRegistry();

registry.register(caddy.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "caddy" }).value;

test("caddy highlights directives", () => {
  const result = highlight("example.com {\n\treverse_proxy localhost:8080\n}");

  expect(result).toContain('<span class="hljs-keyword">reverse_proxy</span>');
});

test("caddy highlights the site address", () => {
  const result = highlight("example.com {\n\tfile_server\n}");

  expect(result).toContain('<span class="hljs-attr">example.com</span>');
});

test("caddy highlights multiple addresses on one site header", () => {
  const result = highlight(
    "example.com www.example.com {\n\treverse_proxy localhost:8080\n}",
  );

  expect(result).toContain(
    '<span class="hljs-attr">example.com www.example.com</span>',
  );
});

test("caddy does not mistake an indented directive with an argument for a site address", () => {
  const result = highlight(
    "example.com {\n\ttransport http {\n\t\ttls\n\t}\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">transport</span>');
  expect(result).not.toContain(
    '<span class="hljs-attr">\ttransport http</span>',
  );
});

test("caddy highlights named matchers", () => {
  const result = highlight("@api path /api/*");

  expect(result).toContain('<span class="hljs-symbol">@api</span>');
});

test("caddy highlights placeholders and comments", () => {
  const result = highlight("# proxy\nheader X-Real-IP {remote_host}");

  expect(result).toContain('<span class="hljs-comment"># proxy</span>');
  expect(result).toContain('<span class="hljs-variable">{remote_host}</span>');
});

test("caddy highlights nested reverse_proxy sub-directives", () => {
  const result = highlight(
    "example.com {\n\treverse_proxy {\n\t\tto localhost:8080\n\t\tlb_policy round_robin\n\t\ttransport http {\n\t\t\ttls\n\t\t\tinsecure_skip_verify\n\t\t}\n\t}\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">to</span>');
  expect(result).toContain('<span class="hljs-keyword">lb_policy</span>');
  expect(result).toContain('<span class="hljs-keyword">transport</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">insecure_skip_verify</span>',
  );
});

test("caddy highlights heredocs and backtick strings", () => {
  const result = highlight(
    ':9000 {\n\trespond <<HTML\n\t\t<html>Hello {host}</html>\n\t\tHTML 200\n\trespond `multi\nline` 201\n\trespond /x "after"\n}',
  );

  expect(result).toContain(
    '<span class="hljs-string">&lt;&lt;HTML\n\t\t&lt;html&gt;Hello {host}&lt;/html&gt;\n\t\tHTML</span> <span class="hljs-number">200</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">`multi\nline`</span> <span class="hljs-number">201</span>',
  );
  // Both closed where they should: the directive after them is styled.
  expect(result).toContain(
    '<span class="hljs-keyword">respond</span> /x <span class="hljs-string">&quot;after&quot;</span>',
  );
});

test("caddy keeps a snippet title on its own line", () => {
  const result = highlight("}\n\n(common) {\n\tencode gzip\n}");

  expect(result).toContain('\n\n<span class="hljs-title">(common)</span> {');
});

test("caddy does not treat an email's @ as a matcher", () => {
  const result = highlight("{\n\temail admin@example.com\n}\n@api path /api/*");

  expect(result).toContain("admin</span>@example.com");
  expect(result).not.toContain('hljs-symbol">@example');
  expect(result).toContain('<span class="hljs-symbol">@api</span>');
});

test("caddy does not fire directive keywords inside paths", () => {
  const result = highlight(
    "example.com {\n\tlog {\n\t\toutput file /var/log/caddy/access.log\n\t}\n}",
  );

  expect(result).toContain('\t<span class="hljs-keyword">log</span> {');
  expect(result).toContain(
    '<span class="hljs-keyword">file</span> /var/log/caddy/access.log',
  );
});

test("caddy highlights durations and sizes with their unit", () => {
  const result = highlight(
    "roll_size 100MiB\nhealth_interval 10s\nroll_keep 5",
  );

  expect(result).toContain('<span class="hljs-number">100MiB</span>');
  expect(result).toContain('<span class="hljs-number">10s</span>');
  expect(result).toContain('<span class="hljs-number">5</span>');
});

test("caddy highlights port-only site addresses", () => {
  const result = highlight(
    ":8080 {\n\trespond ok\n}\nhttp://localhost:2015, :9000 {\n}",
  );

  expect(result).toContain('<span class="hljs-attr">:8080</span> {');
  expect(result).toContain(
    '<span class="hljs-attr">http://localhost:2015, :9000</span> {',
  );
});
