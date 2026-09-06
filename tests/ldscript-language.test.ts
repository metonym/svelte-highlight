import { createRegistry } from "../src/engine.js";

import ldscript from "../src/languages/ldscript";

const registry = createRegistry();

registry.register(ldscript.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "ldscript" }).value;

test("ldscript highlights SECTIONS and MEMORY with high relevance", () => {
  const result = highlight("MEMORY\n{\n}\nSECTIONS\n{\n}");

  expect(result).toContain('<span class="hljs-keyword">MEMORY</span>');
  expect(result).toContain('<span class="hljs-keyword">SECTIONS</span>');
});

test("ldscript highlights section names", () => {
  const result = highlight(".text : { *(.text*) }");

  expect(result).toContain('<span class="hljs-string">.text</span>');
});

test("ldscript highlights memory attributes", () => {
  const result = highlight("FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 256K");

  expect(result).toContain('<span class="hljs-meta">(rx)</span>');
  expect(result).toContain('<span class="hljs-number">0x08000000</span>');
  expect(result).toContain('<span class="hljs-number">256K</span>');
});

test("ldscript highlights region assignment operators", () => {
  const result = highlight("} > RAM AT> FLASH");

  expect(result).toContain('<span class="hljs-operator">AT&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">&gt;</span>');
});

test("ldscript highlights ENTRY and comments", () => {
  const result = highlight("/* a comment */\nENTRY(_start)");

  expect(result).toContain('<span class="hljs-comment">/* a comment */</span>');
  expect(result).toContain('<span class="hljs-keyword">ENTRY</span>');
});
