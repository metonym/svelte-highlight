import { createRegistry } from "../src/engine.js";

import org from "../src/languages/org";

const registry = createRegistry();

registry.register(org.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "org" }).value;

test("org highlights a TODO headline with high relevance", () => {
  const result = highlight("* TODO Write report");

  expect(result).toContain('<span class="hljs-keyword">TODO</span>');
});

test("org highlights priorities and tags in a headline", () => {
  const result = highlight("* TODO Write report [#A]           :work:report:");

  expect(result).toContain('<span class="hljs-meta">[#A]</span>');
  expect(result).toContain('<span class="hljs-symbol">:work:report:</span>');
});

test("org highlights SCHEDULED/DEADLINE keywords and timestamps", () => {
  const result = highlight("SCHEDULED: <2026-09-10 Thu>");

  expect(result).toContain('<span class="hljs-keyword">SCHEDULED:</span>');
  expect(result).toContain(
    '<span class="hljs-number">&lt;2026-09-10 Thu&gt;</span>',
  );
});

test("org highlights property drawers", () => {
  const result = highlight(":PROPERTIES:\n:CREATED: [2026-09-06 Sun]\n:END:");

  expect(result).toContain('<span class="hljs-attr">:PROPERTIES:</span>');
  expect(result).toContain('<span class="hljs-attr">:END:</span>');
});

test("org highlights links and checkboxes", () => {
  const result = highlight("[[https://example.com][dashboard]]\n- [X] done");

  expect(result).toContain('<span class="hljs-link">');
  expect(result).toContain('<span class="hljs-bullet">[X]</span>');
});

test("org highlights meta lines and bold emphasis", () => {
  const result = highlight("#+TITLE: My Doc\n*important*");

  expect(result).toContain('<span class="hljs-meta">#+TITLE:</span>');
  expect(result).toContain('<span class="hljs-strong">*important*</span>');
});
