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

test("org styles only the TODO word right after the stars", () => {
  const result = highlight("* TODO Mark it DONE");

  expect(result).toContain('<span class="hljs-keyword">TODO</span>');
  expect(result).not.toContain('<span class="hljs-keyword">DONE</span>');
});

test("org still highlights a headline after a blank line", () => {
  const result = highlight("intro\n\n* TODO Write report");

  expect(result).toContain('<span class="hljs-keyword">TODO</span>');
});

test("org highlights any #+KEYWORD: line, verse blocks, and CLOCK timestamps", () => {
  const result = highlight(
    "#+NAME: fig\n#+begin_verse\nline\n#+end_verse\nCLOCK: <2026-09-15 Mon 10:00-11:00 +1w>",
  );

  expect(result).toContain('<span class="hljs-meta">#+NAME:</span>');
  expect(result).toContain('<span class="hljs-code">');
  expect(result).toContain('<span class="hljs-keyword">CLOCK:</span>');
  expect(result).toContain(
    '<span class="hljs-number">&lt;2026-09-15 Mon 10:00-11:00 +1w&gt;</span>',
  );
});

test("org highlights inline src, latex, macros, and radio targets", () => {
  const result = highlight(
    "see src_python{print(1)} and \\(x^2\\) {{{greet(world)}}} <<radio>>",
  );

  expect(result).toContain(
    '<span class="hljs-code">src_python{print(1)}</span>',
  );
  expect(result).toContain('<span class="hljs-formula">\\(x^2\\)</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">{{{greet(world)}}}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-link">&lt;&lt;radio&gt;&gt;</span>',
  );
});
