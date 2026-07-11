import { createRegistry } from "../src/engine.js";

import nushell from "../src/languages/nushell";

const registry = createRegistry();

registry.register(nushell.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "nushell" }).value;

test("nushell highlights keywords", () => {
  const result = highlight("let x = 1\nmut y = 2");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">mut</span>');
});

test("nushell highlights builtin commands", () => {
  const result = highlight("ls | where size > 10 | sort-by name");

  expect(result).toContain('<span class="hljs-built_in">ls</span>');
  expect(result).toContain('<span class="hljs-built_in">where</span>');
  expect(result).toContain('<span class="hljs-built_in">sort-by</span>');
});

test("nushell highlights command definitions", () => {
  const result = highlight("def greet [] { print hi }");

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain('<span class="hljs-title function_">greet</span>');
});

test("nushell highlights variables", () => {
  const result = highlight("print $greeting");

  expect(result).toContain('<span class="hljs-variable">$greeting</span>');
});

test("nushell highlights flags", () => {
  const result = highlight("ls --all -l");

  expect(result).toContain("hljs-symbol");
});

test("nushell highlights numbers with units", () => {
  const result = highlight("let dur = 5min\nlet size = 1kb");

  expect(result).toContain('<span class="hljs-number">5min</span>');
  expect(result).toContain('<span class="hljs-number">1kb</span>');
});

test("nushell highlights interpolated strings", () => {
  const result = highlight('let name = "world"\nprint $"Hello ($name)!"');

  expect(result).toContain(
    '<span class="hljs-string">$&quot;Hello <span class="hljs-subst">(<span class="hljs-variable">$name</span>)</span>!&quot;</span>',
  );
});

test("nushell highlights raw strings without treating them as comments", () => {
  const result = highlight("let path = r#'C:\\Users\\test'#");

  expect(result).toContain(
    '<span class="hljs-string">r#&#x27;C:\\Users\\test&#x27;#</span>',
  );
  expect(result).not.toContain("hljs-comment");
});
