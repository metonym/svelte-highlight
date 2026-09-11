import { createRegistry } from "../src/engine.js";

import regex from "../src/languages/regex";

const registry = createRegistry();

registry.register(regex.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "regex" }).value;

test("regex highlights named groups with high relevance", () => {
  const result = highlight(String.raw`(?<year>\d{4})`);

  expect(result).toContain('<span class="hljs-meta">(?&lt;</span>');
  expect(result).toContain('<span class="hljs-title function_">year</span>');
});

test("regex highlights lookahead and lookbehind group openers", () => {
  const result = highlight("(?=foo)(?<=bar)");

  expect(result).toContain('<span class="hljs-meta">(?=</span>');
  expect(result).toContain('<span class="hljs-meta">(?&lt;</span>');
  expect(result).toContain('<span class="hljs-meta">=</span>');
});

test("regex highlights quantifiers", () => {
  const result = highlight("a{2,4}b*?");

  expect(result).toContain('<span class="hljs-number">{2,4}</span>');
  expect(result).toContain('<span class="hljs-operator">*?</span>');
});

test("regex highlights character classes and POSIX names", () => {
  const result = highlight("[[:alpha:]]");

  expect(result).toContain('<span class="hljs-built_in">alpha</span>');
});

test("regex highlights escape classes and unicode properties", () => {
  const result = highlight(String.raw`\d\w\p{L}`);

  expect(result).toContain('<span class="hljs-built_in">\\d</span>');
  expect(result).toContain('<span class="hljs-built_in">\\p{L}</span>');
});

test("regex highlights backreferences and inline comments", () => {
  const result = highlight(String.raw`\k<name>\1(?#note)`);

  expect(result).toContain('<span class="hljs-symbol">\\k&lt;name&gt;</span>');
  expect(result).toContain('<span class="hljs-symbol">\\1</span>');
  expect(result).toContain('<span class="hljs-comment">(?#note)</span>');
});

test("regex highlights unicode and control escapes", () => {
  const result = highlight(String.raw`\u1234\cA`);

  expect(result).toContain('<span class="hljs-built_in">\\u1234</span>');
  expect(result).toContain('<span class="hljs-built_in">\\cA</span>');
});

test("regex still highlights a two-digit hex escape", () => {
  const result = highlight(String.raw`\x41`);

  expect(result).toContain('<span class="hljs-built_in">\\x41</span>');
});
