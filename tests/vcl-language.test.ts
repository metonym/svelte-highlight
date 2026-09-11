import { createRegistry } from "../src/engine.js";

import vcl from "../src/languages/vcl";

const registry = createRegistry();

registry.register(vcl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "vcl" }).value;

test("vcl highlights the vcl 4.1 header as the relevance carrier", () => {
  const result = highlight("vcl 4.1;");

  expect(result).toContain('<span class="hljs-meta">vcl 4.1;</span>');
});

test("vcl highlights built-in subroutine names", () => {
  const result = highlight("sub vcl_recv {\n}");

  expect(result).toContain('<span class="hljs-keyword">sub</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">vcl_recv</span>',
  );
});

test("vcl highlights request/response variables", () => {
  const result = highlight('if (req.method == "PURGE") {');

  expect(result).toContain('<span class="hljs-variable">req.method</span>');
});

test("vcl highlights return actions as literals", () => {
  const result = highlight("return (purge);");

  expect(result).toContain('<span class="hljs-literal">purge</span>');
});

test("vcl highlights durations", () => {
  const result = highlight("set beresp.ttl = 1h;");

  expect(result).toContain('<span class="hljs-number">1h</span>');
});

test("vcl highlights the vcl switch return action", () => {
  const result = highlight("return (vcl(legacy_label));");

  expect(result).toContain('<span class="hljs-literal">vcl</span>');
});

test("vcl highlights hyphenated HTTP header variables", () => {
  const result = highlight("set req.http.X-Forwarded-For = client.ip;");

  expect(result).toContain(
    '<span class="hljs-variable">req.http.X-Forwarded-For</span>',
  );
});

test("vcl does not treat a version header as a return action", () => {
  const result = highlight("vcl 4.1;\nreturn (hash);");

  expect(result).toContain('<span class="hljs-meta">vcl 4.1;</span>');
  expect(result).toContain('<span class="hljs-literal">hash</span>');
});
