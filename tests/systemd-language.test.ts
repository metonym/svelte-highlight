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

test("systemd highlights hyphenated and dotted literals as one token", () => {
  const result = highlight(
    "Restart=on-failure\nType=notify-reload\nWantedBy=multi-user.target",
  );

  expect(result).toContain('<span class="hljs-literal">on-failure</span>');
  expect(result).toContain('<span class="hljs-literal">notify-reload</span>');
  expect(result).toContain(
    '<span class="hljs-literal">multi-user.target</span>',
  );
  expect(result).not.toContain('<span class="hljs-literal">on</span>-');
});

test("systemd highlights the full specifier table", () => {
  const result = highlight(
    "ExecStart=/usr/bin/app --config=%E/app.toml --state=%S/app --creds=%d",
  );

  expect(result).toContain('<span class="hljs-template-variable">%E</span>');
  expect(result).toContain('<span class="hljs-template-variable">%S</span>');
  expect(result).toContain('<span class="hljs-template-variable">%d</span>');
});

test("systemd highlights numbers together with their unit", () => {
  const result = highlight(
    "RestartSec=5s\nTimeoutStopSec=1min 30s\nMemoryMax=512M\nCPUQuota=50%",
  );

  expect(result).toContain('<span class="hljs-number">5s</span>');
  expect(result).toContain(
    '<span class="hljs-number">1min</span> <span class="hljs-number">30s</span>',
  );
  expect(result).toContain('<span class="hljs-number">512M</span>');
  expect(result).toContain('<span class="hljs-number">50%</span>');
});

test("systemd highlights newer keys and sections as built-ins", () => {
  const result = highlight(
    "[Swap]\nWhat=/dev/sda2\n[Service]\nImportCredential=app.*\nRestartMode=direct\n[Timer]\nDeferReactivation=yes",
  );

  expect(result).toContain('<span class="hljs-section">[Swap]</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">ImportCredential</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">RestartMode</span>=<span class="hljs-literal">direct</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">DeferReactivation</span>',
  );
});

test("systemd keeps unknown keys as attrs and literal-like words inside tokens plain", () => {
  const result = highlight(
    "Unknown=1\nExecStart=/usr/bin/myapp-notify --no-color",
  );

  expect(result).toContain('<span class="hljs-attr">Unknown</span>');
  expect(result).not.toContain("hljs-literal");
});
