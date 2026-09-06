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
