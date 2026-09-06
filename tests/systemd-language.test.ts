import { createRegistry } from "../src/engine.js";

import systemd from "../src/languages/systemd";

const registry = createRegistry();

registry.register(systemd.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "systemd" }).value;

test("systemd highlights known section headers", () => {
  const result = highlight("[Service]");

  expect(result).toContain('<span class="hljs-section">[Service]</span>');
});

test("systemd highlights well-known keys as built-ins", () => {
  const result = highlight("ExecStart=/usr/bin/example");

  expect(result).toContain('<span class="hljs-built_in">ExecStart</span>');
});

test("systemd highlights unknown keys as generic attrs", () => {
  const result = highlight("CustomKey=value");

  expect(result).toContain('<span class="hljs-attr">CustomKey</span>');
});

test("systemd highlights specifiers and variables", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: ${HOME} is systemd syntax, not JS interpolation
  const result = highlight("Environment=PORT=%p HOME=${HOME}");

  expect(result).toContain('<span class="hljs-template-variable">%p</span>');
  // biome-ignore lint/suspicious/noTemplateCurlyInString: ${HOME} is systemd syntax, not JS interpolation
  expect(result).toContain('<span class="hljs-variable">${HOME}</span>');
});

test("systemd highlights literal values", () => {
  const result = highlight("Type=oneshot");

  expect(result).toContain('<span class="hljs-literal">oneshot</span>');
});

test("systemd highlights exec prefixes before a path", () => {
  const result = highlight("ExecStartPre=-/usr/bin/mkdir -p /run/example");

  expect(result).toContain('<span class="hljs-operator">-</span>');
});
