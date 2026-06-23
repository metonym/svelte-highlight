import hljs from "highlight.js/lib/core";
import cue from "../src/languages/cue";

hljs.registerLanguage(cue.name, cue.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "cue" }).value;

test("cue highlights package and import keywords", () => {
  const result = highlight("package config");

  expect(result).toContain('<span class="hljs-keyword">package</span>');
});

test("cue highlights definitions", () => {
  const result = highlight("#Schema: {}");

  expect(result).toContain('<span class="hljs-title class_">#Schema</span>');
});

test("cue highlights builtin types", () => {
  const result = highlight("name: string");

  expect(result).toContain('<span class="hljs-type">string</span>');
});

test("cue highlights strings and numbers", () => {
  const result = highlight('host: "localhost"\nport: 8080');

  expect(result).toContain(
    '<span class="hljs-string">&quot;localhost&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">8080</span>');
});
