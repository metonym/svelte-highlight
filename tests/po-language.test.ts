import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";

import po from "../src/languages/po";

const registry = createRegistry();

registry.register(po.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "po" }).value;

test("po highlights entry keywords and plural indexes", () => {
  const result = highlight(
    'msgctxt "menu"\nmsgid "file"\nmsgid_plural "files"\nmsgstr[0] "Datei"\nmsgstr[1] "Dateien"',
  );

  expect(result).toContain('<span class="hljs-keyword">msgctxt</span>');
  expect(result).toContain('<span class="hljs-keyword">msgid</span>');
  expect(result).toContain('<span class="hljs-keyword">msgid_plural</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">msgstr</span>[<span class="hljs-number">1</span>]',
  );
  expect(result).toContain(
    '<span class="hljs-string">&quot;Datei&quot;</span>',
  );
});

test("po highlights escapes and format placeholders in strings", () => {
  const result = highlight(
    'msgid "%1$s has %(count)d items in {folder}\\n"\nmsgstr "%.2f%%\\t\\"ok\\""',
  );

  expect(result).toContain('<span class="hljs-template-variable">%1$s</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">%(count)d</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-variable">{folder}</span>',
  );
  expect(result).toContain('<span class="hljs-template-variable">%.2f</span>');
  expect(result).toContain('<span class="hljs-template-variable">%%</span>');
  expect(result).toContain('<span class="hljs-char escape_">\\n</span>');
  expect(result).toContain('<span class="hljs-char escape_">\\&quot;</span>');
});

test("po keeps a percent sign before a space plain", () => {
  const result = highlight('msgid "Saved 50% done"');

  expect(result).not.toContain("hljs-template-variable");
});

test("po highlights flags and source references", () => {
  const result = highlight("#, fuzzy, c-format\n#: src/main.c:42 lib/util.c:7");

  expect(result).toContain(
    '<span class="hljs-meta">#, <span class="hljs-keyword">fuzzy</span>, <span class="hljs-keyword">c-format</span></span>',
  );
  expect(result).toContain(
    '<span class="hljs-comment">#: <span class="hljs-symbol">src/main.c:42</span> <span class="hljs-symbol">lib/util.c:7</span></span>',
  );
});

test("po renders other comment kinds as comments", () => {
  const result = highlight(
    '# translator note\n#. extracted note\n#| msgid "Old"\n#~ msgid "Obsolete"',
  );

  expect(result).toContain(
    '<span class="hljs-comment">#| msgid &quot;Old&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-comment">#~ msgid &quot;Obsolete&quot;</span>',
  );
  expect(result).not.toContain("hljs-keyword");
});

test("po highlights header field names", () => {
  const result = highlight(
    'msgstr ""\n"Content-Type: text/plain; charset=UTF-8\\n"\n"Error: not a header\\n"',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;<span class="hljs-attr">Content-Type</span>: text/plain; charset=UTF-8',
  );
  expect(result).not.toContain('<span class="hljs-attr">Error</span>');
});

test("po resolves the pot and gettext aliases", () => {
  expect(resolveLanguageName("pot")).toBe("po");
  expect(resolveLanguageName("gettext")).toBe("po");
});
