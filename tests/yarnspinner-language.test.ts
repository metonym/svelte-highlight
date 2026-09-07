import { createRegistry } from "../src/engine.js";

import yarnspinner from "../src/languages/yarnspinner";

const registry = createRegistry();

registry.register(yarnspinner.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "yarnspinner" }).value;

test("yarnspinner highlights the title header key with high relevance", () => {
  const result = highlight("title: Start");

  expect(result).toContain('<span class="hljs-attr">title</span>');
});

test("yarnspinner highlights node delimiters", () => {
  const result = highlight("---\nHello\n===");

  expect(result).toContain('<span class="hljs-meta">---</span>');
  expect(result).toContain('<span class="hljs-meta">===</span>');
});

test("yarnspinner highlights option arrows", () => {
  const result = highlight("-> Attack");

  expect(result).toContain('<span class="hljs-bullet">-&gt;</span>');
});

test("yarnspinner highlights commands with keywords and variables", () => {
  const result = highlight("<<set $fought to true>>");

  expect(result).toContain('<span class="hljs-meta">&lt;&lt;</span>');
  expect(result).toContain('<span class="hljs-keyword">set</span>');
  expect(result).toContain('<span class="hljs-variable">$fought</span>');
  expect(result).toContain('<span class="hljs-meta">&gt;&gt;</span>');
});

test("yarnspinner highlights inline expressions and markup tags", () => {
  const result = highlight("Hello, {$player_name}! [wave]hi[/wave]");

  expect(result).toContain('<span class="hljs-subst">{');
  expect(result).toContain('<span class="hljs-tag">[wave]</span>');
});

test("yarnspinner highlights hashtags and comments", () => {
  const result = highlight("// a comment\nHalt! #line:abc123");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-meta">#line:abc123</span>');
});
