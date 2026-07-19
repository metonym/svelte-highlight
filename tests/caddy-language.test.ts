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
