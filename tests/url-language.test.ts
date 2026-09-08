import { createRegistry } from "../src/engine.js";

import url from "../src/languages/url";

const registry = createRegistry();

registry.register(url.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "url" }).value;

test("url highlights the scheme and separator as meta", () => {
  const result = highlight("https://example.com");

  expect(result).toContain('<span class="hljs-meta">https://</span>');
});

test("url highlights a scheme without a host, like mailto:, as meta", () => {
  const result = highlight("mailto:jane@example.com");

  expect(result).toContain('<span class="hljs-meta">mailto:</span>');
});

test("url highlights userinfo and host as link", () => {
  const result = highlight("https://user:pass@example.com/path");

  expect(result).toContain(
    '<span class="hljs-link">user:pass@example.com</span>',
  );
});

test("url highlights the port as a number", () => {
  const result = highlight("https://example.com:8443/path");

  expect(result).toContain('<span class="hljs-number">:8443</span>');
});

test("url highlights query keys, values, and punctuation", () => {
  const result = highlight("https://example.com/search?q=highlight&limit=20");

  expect(result).toContain('<span class="hljs-punctuation">?</span>');
  expect(result).toContain('<span class="hljs-attr">q</span>');
  expect(result).toContain('<span class="hljs-string">highlight</span>');
  expect(result).toContain('<span class="hljs-punctuation">&amp;</span>');
  expect(result).toContain('<span class="hljs-attr">limit</span>');
  expect(result).toContain('<span class="hljs-string">20</span>');
});

test("url highlights the fragment as a symbol", () => {
  const result = highlight("https://example.com/docs#installation");

  expect(result).toContain('<span class="hljs-symbol">#installation</span>');
});
