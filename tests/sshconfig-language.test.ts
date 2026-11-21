import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";

import sshconfig from "../src/languages/sshconfig";

const registry = createRegistry();

registry.register(sshconfig.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "sshconfig" }).value;

test("sshconfig highlights Host blocks and directives", () => {
  const result = highlight(
    "# work\nHost *.internal !legacy\n  HostName 192.0.2.10\n  Port 2222\n  ForwardAgent yes",
  );

  expect(result).toContain('<span class="hljs-comment"># work</span>');
  expect(result).toContain('<span class="hljs-keyword">Host</span>');
  expect(result).toContain('<span class="hljs-section">*.internal</span>');
  expect(result).toContain('<span class="hljs-section">!legacy</span>');
  expect(result).toContain('<span class="hljs-attr">HostName</span>');
  expect(result).toContain('<span class="hljs-number">192.0.2.10</span>');
  expect(result).toContain('<span class="hljs-number">2222</span>');
  expect(result).toContain('<span class="hljs-literal">yes</span>');
});

test("sshconfig matches directive names in any case", () => {
  const result = highlight("host *\n  identityfile ~/.ssh/id_rsa\nUser=git");

  expect(result).toContain('<span class="hljs-keyword">host</span>');
  expect(result).toContain('<span class="hljs-attr">identityfile</span>');
  expect(result).toContain('<span class="hljs-attr">User</span>=git');
});

test("sshconfig highlights Match criteria as whole words", () => {
  const result = highlight(
    'Match user git host host1.example.com exec "test -f ${HOME}/.vpn"',
  );

  expect(result).toContain('<span class="hljs-keyword">Match</span>');
  expect(result).toContain('<span class="hljs-built_in">user</span>');
  expect(result).toContain('<span class="hljs-built_in">host</span>');
  expect(result).toContain(" host1.example.com ");
  expect(result).toContain('<span class="hljs-variable">${HOME}</span>');
});

test("sshconfig highlights percent tokens", () => {
  const result = highlight("ControlPath ~/.ssh/cm-%r@%h:%p");

  expect(result).toContain('<span class="hljs-template-variable">%r</span>');
  expect(result).toContain('<span class="hljs-template-variable">%h</span>');
  expect(result).toContain('<span class="hljs-template-variable">%p</span>');
});

test("sshconfig keeps digits inside values plain", () => {
  const result = highlight(
    "IdentityFile ~/.ssh/id_ed25519\nMACs hmac-sha2-256,hmac-sha2-512",
  );

  expect(result).not.toContain("hljs-number");
});

test("sshconfig resolves its aliases", () => {
  expect(resolveLanguageName("ssh-config")).toBe("sshconfig");
  expect(resolveLanguageName("ssh_config")).toBe("sshconfig");
  expect(resolveLanguageName("sshd_config")).toBe("sshconfig");
});

test("sshconfig is excluded from auto-detection", () => {
  const all = createRegistry();
  all.register(sshconfig.register);

  expect(
    all.highlightAuto("Host example\n  HostName example.com\n  User git")
      .language,
  ).not.toBe("sshconfig");
});
