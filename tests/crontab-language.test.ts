import { createRegistry } from "../src/engine.js";

import crontab from "../src/languages/crontab";

const registry = createRegistry();

registry.register(crontab.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "crontab" }).value;

test("crontab highlights a wildcard schedule field as a number", () => {
  const result = highlight("* * * * * /usr/local/bin/backup.sh");

  expect(result).toContain('<span class="hljs-number">*</span>');
});

test("crontab highlights a step field", () => {
  const result = highlight("*/15 * * * * root /usr/bin/check-disk.sh");

  expect(result).toContain('<span class="hljs-number">*/15</span>');
});

test("crontab highlights month and day names as built-ins", () => {
  const result = highlight("0 9 1 JAN-MAR * echo hi");

  expect(result).toContain('<span class="hljs-built_in">JAN-MAR</span>');
});

test("crontab highlights schedule nicknames as keywords", () => {
  const result = highlight("@reboot /usr/local/bin/on-boot.sh");

  expect(result).toContain('<span class="hljs-keyword">@reboot</span>');
});

test("crontab highlights environment variable lines", () => {
  const result = highlight("MAILTO=admin@example.com");

  expect(result).toContain('<span class="hljs-variable">MAILTO</span>');
  expect(result).toContain('<span class="hljs-string">admin@example.com');
});

test("crontab highlights comments", () => {
  const result = highlight("# run backups nightly");

  expect(result).toContain(
    '<span class="hljs-comment"># run backups nightly</span>',
  );
});

test("crontab highlights an indented schedule line", () => {
  const result = highlight("  15 2 * * * /usr/bin/indented");

  expect(result).toContain(
    '  <span class="hljs-number">15</span> <span class="hljs-number">2</span> <span class="hljs-number">*</span>',
  );
  expect(result).toContain(
    '<span class="hljs-number">*</span> /usr/bin/indented',
  );
});

test("crontab highlights cronie random ranges as numbers", () => {
  const result = highlight("0 3~5 * * * /usr/bin/a\n5 ~ * * * /usr/bin/b");

  expect(result).toContain('<span class="hljs-number">3~5</span>');
  expect(result).toContain('<span class="hljs-number">~</span>');
});

test("crontab highlights lowercase month and day names as built-ins", () => {
  const result = highlight("0 9 1 jan-mar sun /usr/bin/x");

  expect(result).toContain('<span class="hljs-built_in">jan-mar</span>');
  expect(result).toContain('<span class="hljs-built_in">sun</span>');
});

test("crontab keeps a bare word schedule field unstyled", () => {
  const result = highlight("0 9 * * foo /usr/bin/x");

  expect(result).not.toContain('hljs-built_in">foo');
  expect(result).toContain('<span class="hljs-number">*</span> foo ');
});
