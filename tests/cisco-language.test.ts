import { createRegistry } from "../src/engine.js";

import cisco from "../src/languages/cisco";

const registry = createRegistry();

registry.register(cisco.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cisco" }).value;

test("cisco highlights interface names as class titles", () => {
  const result = highlight("interface GigabitEthernet0/0/1");

  expect(result).toContain('<span class="hljs-keyword">interface</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">GigabitEthernet0/0/1</span>',
  );
});

test("cisco highlights comment lines starting with !", () => {
  const result = highlight("! configure the uplink interface");

  expect(result).toContain(
    '<span class="hljs-comment">! configure the uplink interface</span>',
  );
});

test("cisco highlights IP addresses as numbers", () => {
  const result = highlight("ip address 192.168.1.1 255.255.255.0");

  expect(result).toContain('<span class="hljs-number">192.168.1.1</span>');
});

test("cisco highlights built-in ACL words", () => {
  const result = highlight(
    "access-list 101 permit tcp any host 10.0.0.5 eq 443",
  );

  expect(result).toContain('<span class="hljs-built_in">any</span>');
  expect(result).toContain('<span class="hljs-built_in">host</span>');
  expect(result).toContain('<span class="hljs-built_in">eq</span>');
});

test("cisco is case-insensitive for keywords", () => {
  const result = highlight("INTERFACE Vlan10");

  expect(result).toContain('<span class="hljs-keyword">INTERFACE</span>');
});
