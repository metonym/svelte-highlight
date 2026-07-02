import hljs from "highlight.js/lib/core";
import toml from "../src/languages/toml";

hljs.registerLanguage(toml.name, toml.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "toml" }).value;

test("toml highlights tables and array-of-tables", () => {
  const result = highlight("[server]\n\n[[products]]");

  expect(result).toContain('<span class="hljs-section">[server]</span>');
  expect(result).toContain('<span class="hljs-section">[[products]]</span>');
});

test("toml highlights keys as attributes", () => {
  const result = highlight('host = "localhost"\ndotted.key = 1');

  expect(result).toContain('<span class="hljs-attr">host</span>');
  expect(result).toContain('<span class="hljs-attr">dotted.key</span>');
});

test("toml highlights quoted keys as attributes", () => {
  const result = highlight(
    '"127.0.0.1" = "value"\n\'key with spaces\' = 1\na."b.c".d = 1',
  );

  expect(result).toContain(
    '<span class="hljs-attr">&quot;127.0.0.1&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-attr">&#x27;key with spaces&#x27;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-attr">a.&quot;b.c&quot;.d</span>',
  );
});

test("toml highlights strings", () => {
  const result = highlight("name = \"value\"\nliteral = 'raw'");

  expect(result).toContain(
    '<span class="hljs-string">&quot;value&quot;</span>',
  );
  expect(result).toContain("hljs-string");
});

test("toml highlights numbers, hex, octal, and binary", () => {
  const result = highlight("a = 42\nb = 0x1F\nc = 0o17\nd = 0b1010\ne = 3.14");

  expect(result).toContain("hljs-number");
});

test("toml highlights dates", () => {
  const result = highlight("updated = 2024-01-02T10:00:00Z");

  expect(result).toContain(
    '<span class="hljs-number">2024-01-02T10:00:00Z</span>',
  );
});

test("toml highlights boolean literals", () => {
  const result = highlight("enabled = true\ndisabled = false");

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">false</span>');
});
