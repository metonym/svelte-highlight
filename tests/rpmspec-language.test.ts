import { createRegistry } from "../src/engine.js";

import rpmspec from "../src/languages/rpmspec";

const registry = createRegistry();

registry.register(rpmspec.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "rpmspec" }).value;

test("rpmspec highlights preamble tags", () => {
  const result = highlight("Name: mypackage\nVersion: 1.0");

  expect(result).toContain('<span class="hljs-attr">Name</span>');
  expect(result).toContain('<span class="hljs-attr">Version</span>');
});

test("rpmspec highlights section headers with high relevance", () => {
  const result = highlight("%description\nThis is an example package.");

  expect(result).toContain('<span class="hljs-section">%description</span>');
});

test("rpmspec highlights macros", () => {
  const result = highlight("Release: 1%{?dist}");

  expect(result).toContain(
    '<span class="hljs-template-variable">%{?dist}</span>',
  );
});

test("rpmspec highlights conditionals and file attributes", () => {
  const result = highlight("%if 0%{?fedora}\n%license LICENSE\n%endif");

  expect(result).toContain('<span class="hljs-keyword">%if</span>');
  expect(result).toContain('<span class="hljs-built_in">%license</span>');
  expect(result).toContain('<span class="hljs-keyword">%endif</span>');
});

test("rpmspec highlights changelog entries and comments", () => {
  const result = highlight(
    "# a comment\n* Mon Jan 01 2024 Jane Doe <jane@example.com> - 1.0-1",
  );

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-meta">');
});
