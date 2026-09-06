import { createRegistry } from "../src/engine.js";

import kconfig from "../src/languages/kconfig";

const registry = createRegistry();

registry.register(kconfig.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "kconfig" }).value;

test("kconfig highlights config definitions with high relevance", () => {
  const result = highlight('config DEBUG_KERNEL\n    bool "Kernel debugging"');

  expect(result).toContain('<span class="hljs-keyword">config</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">DEBUG_KERNEL</span>',
  );
});

test("kconfig highlights attribute keywords", () => {
  const result = highlight('bool "Kernel debugging"');

  expect(result).toContain('<span class="hljs-attr">bool</span>');
});

test("kconfig highlights literal values", () => {
  const result = highlight("default n");

  expect(result).toContain('<span class="hljs-literal">n</span>');
});

test("kconfig highlights depends on", () => {
  const result = highlight("depends on DEBUG_KERNEL");

  expect(result).toContain('<span class="hljs-keyword">depends</span>');
  expect(result).toContain('<span class="hljs-keyword">on</span>');
});

test("kconfig highlights help bodies as indented text", () => {
  const result = highlight("help\n  Say Y here.\nconfig LOG_LEVEL");

  expect(result).toContain('<span class="hljs-keyword">help</span>');
  expect(result).toContain('<span class="hljs-comment">');
});
