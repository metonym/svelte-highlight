import { createRegistry } from "../src/engine.js";

import dtrace from "../src/languages/dtrace";

const registry = createRegistry();

registry.register(dtrace.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dtrace" }).value;

test("dtrace highlights probe descriptions as the relevance carrier", () => {
  const result = highlight("syscall::read:entry\n{\n}");

  expect(result).toContain(
    '<span class="hljs-title function_">syscall::read:entry</span>',
  );
});

test("dtrace highlights built-in variables", () => {
  const result = highlight("self->start = timestamp;");

  expect(result).toContain('<span class="hljs-variable language_">self</span>');
  expect(result).toContain(
    '<span class="hljs-variable language_">timestamp</span>',
  );
});

test("dtrace highlights actions as built-ins", () => {
  const result = highlight('printf("%s\\n", execname);');

  expect(result).toContain('<span class="hljs-built_in">printf</span>');
});

test("dtrace highlights the shebang and pragma", () => {
  const result = highlight("#!/usr/sbin/dtrace -s\n#pragma D option quiet");

  expect(result).toContain('<span class="hljs-meta">');
});

test("dtrace highlights aggregations", () => {
  const result = highlight("@counts[execname] = count();");

  expect(result).toContain('<span class="hljs-variable">@counts</span>');
});
