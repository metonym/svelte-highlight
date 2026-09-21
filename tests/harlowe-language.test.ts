import { createRegistry } from "../src/engine.js";

import harlowe from "../src/languages/harlowe";

const registry = createRegistry();

registry.register(harlowe.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "harlowe" }).value;

test("harlowe highlights a macro name as a keyword", () => {
  const result = highlight("(set: $health to 100)");

  expect(result).toContain('<span class="hljs-keyword">set</span>');
});

test("harlowe highlights story and temp variables", () => {
  const result = highlight("(set: $health to 100)(set: _count to 0)");

  expect(result).toContain('<span class="hljs-variable">$health</span>');
  expect(result).toContain('<span class="hljs-variable">_count</span>');
});

test("harlowe highlights expression keywords scoped inside a macro call", () => {
  const result = highlight("(set: $health to 100)");

  expect(result).toContain('<span class="hljs-keyword">to</span>');
});

test("harlowe highlights nested macro calls", () => {
  const result = highlight("(if: (either: 1, 2) > 3)[Lucky!]");

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">either</span>');
});

test("harlowe highlights double-bracket links as strings", () => {
  const result = highlight("[[Continue->NextRoom]]");

  expect(result).toContain(
    '<span class="hljs-string">[[Continue-&gt;NextRoom]]</span>',
  );
});

test("harlowe does not treat a plain English parenthetical as a macro call", () => {
  const result = highlight("(if it rains, we stay home)");

  expect(result).not.toContain('class="hljs-keyword"');
});

test("harlowe does not treat single-bracket diagram syntax as a link", () => {
  const result = highlight("[A]->[B]");

  expect(result).not.toContain('class="hljs-string"');
});
