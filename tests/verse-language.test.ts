import { createRegistry } from "../src/engine.js";

import verse from "../src/languages/verse";

const registry = createRegistry();

registry.register(verse.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "verse" }).value;

test("verse highlights the := definition operator", () => {
  const result = highlight("counter_device := class(creative_device):");

  expect(result).toContain('<span class="hljs-operator">:=</span>');
  expect(result).toContain('<span class="hljs-keyword">class</span>');
});

test("verse highlights the decides and suspends specifiers", () => {
  const result = highlight("GetCount<public>()<decides><transacts> : int =");

  expect(result).toContain('<span class="hljs-meta">&lt;decides&gt;</span>');
  expect(result).toContain('<span class="hljs-meta">&lt;public&gt;</span>');
});

test("verse highlights keywords and types", () => {
  const result = highlight("loop:\n  Count : int = 0");

  expect(result).toContain('<span class="hljs-keyword">loop</span>');
  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("verse highlights block and line comments", () => {
  const result = highlight("<# block #>\n# line comment");

  expect(result).toContain(
    '<span class="hljs-comment">&lt;# block #&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-comment"># line comment</span>');
});

test("verse highlights editable attributes", () => {
  const result = highlight("@editable\nVar Health : int = 100");

  expect(result).toContain('<span class="hljs-meta">@editable</span>');
});
