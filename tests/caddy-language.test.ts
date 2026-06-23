import hljs from "highlight.js/lib/core";
import caddy from "../src/languages/caddy";

hljs.registerLanguage(caddy.name, caddy.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "caddy" }).value;

test("caddy highlights directives", () => {
  const result = highlight("example.com {\n\treverse_proxy localhost:8080\n}");

  expect(result).toContain('<span class="hljs-keyword">reverse_proxy</span>');
});

test("caddy highlights the site address", () => {
  const result = highlight("example.com {\n\tfile_server\n}");

  expect(result).toContain('<span class="hljs-attr">example.com</span>');
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
