import { createRegistry } from "../src/engine.js";

import yara from "../src/languages/yara";

const registry = createRegistry();

registry.register(yara.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "yara" }).value;

test("yara highlights the rule name as the relevance carrier", () => {
  const result = highlight("rule SuspiciousExecutable {");

  expect(result).toContain('<span class="hljs-keyword">rule</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">SuspiciousExecutable</span>',
  );
});

test("yara highlights sections", () => {
  const result = highlight('meta:\n  author = "analyst"');

  expect(result).toContain('<span class="hljs-section">meta:</span>');
});

test("yara highlights string identifiers", () => {
  const result = highlight('$a = "malicious_string" nocase');

  expect(result).toContain('<span class="hljs-variable">$a</span>');
  expect(result).toContain('<span class="hljs-keyword">nocase</span>');
});

test("yara highlights module prefixes as built-ins", () => {
  const result = highlight("pe.number_of_sections > 3");

  expect(result).toContain(
    '<span class="hljs-built_in">pe.number_of_sections</span>',
  );
});

test("yara highlights comments and condition keywords", () => {
  const result = highlight("// a comment\ncondition:\n  $a and $hex");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-section">condition:</span>');
  expect(result).toContain('<span class="hljs-keyword">and</span>');
});
