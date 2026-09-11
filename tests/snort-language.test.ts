import { createRegistry } from "../src/engine.js";

import snort from "../src/languages/snort";

const registry = createRegistry();

registry.register(snort.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "snort" }).value;

test("snort highlights the alert action", () => {
  const result = highlight("alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (");

  expect(result).toContain('<span class="hljs-keyword">alert</span>');
  expect(result).toContain('<span class="hljs-type">tcp</span>');
});

test("snort highlights variables and the direction operator", () => {
  const result = highlight("$EXTERNAL_NET any -> $HOME_NET 80");

  expect(result).toContain('<span class="hljs-variable">$EXTERNAL_NET</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("snort highlights option keys", () => {
  const result = highlight('msg:"Suspicious User-Agent"; sid:1000001;');

  expect(result).toContain('<span class="hljs-attr">msg</span>');
  expect(result).toContain('<span class="hljs-attr">sid</span>');
});

test("snort highlights pcre options as regexp", () => {
  const result = highlight('pcre:"/evil[0-9]+/i";');

  expect(result).toContain(
    '<span class="hljs-regexp">pcre:&quot;/evil[0-9]+/i&quot;</span>',
  );
});

test("snort highlights hex bytes inside content strings", () => {
  const result = highlight('content:"User-Agent|3A|";');

  expect(result).toContain('<span class="hljs-number">|3A|</span>');
});

test("snort highlights Snort 3 actions at the start of a line", () => {
  const result = highlight(
    "block icmp any any -> any any (sid:1;)\nrewrite tcp any any -> any any (sid:2;)\n  react tcp any any -> any any (sid:3;)",
  );

  expect(result).toContain('<span class="hljs-keyword">block</span>');
  expect(result).toContain('<span class="hljs-keyword">rewrite</span>');
  expect(result).toContain('<span class="hljs-keyword">react</span>');
});

test("snort does not style an action word that appears inside an option", () => {
  const result = highlight(
    'alert tcp any any -> any any (msg:"x"; metadata:policy balanced-ips drop, policy security-ips drop; sid:1;)\noutput alert_fast: alerts.log',
  );

  expect(result).toContain('<span class="hljs-keyword">alert</span> ');
  expect(result).not.toContain('<span class="hljs-keyword">drop</span>');
  expect(result).not.toContain('<span class="hljs-keyword">log</span>');
});

test("snort highlights bare options, sticky buffers and spaced modifiers", () => {
  const result = highlight(
    'alert http any any -> any any (http_uri; content:"/admin", nocase, offset 0, depth 32; file_data; http.user_agent; content:"curl"; sid:1;)',
  );

  expect(result).toContain('<span class="hljs-attr">http_uri</span>;');
  expect(result).toContain('<span class="hljs-attr">nocase</span>,');
  expect(result).toContain(
    '<span class="hljs-attr">offset</span> <span class="hljs-number">0</span>',
  );
  expect(result).toContain(
    '<span class="hljs-attr">depth</span> <span class="hljs-number">32</span>',
  );
  expect(result).toContain('<span class="hljs-attr">file_data</span>;');
  expect(result).toContain('<span class="hljs-attr">http.user_agent</span>;');
});

test("snort leaves option-looking words inside strings and values alone", () => {
  const result = highlight(
    'alert tcp any any -> any any (msg:"nocase http_uri"; flow:to_server,established; sid:1;)',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;nocase http_uri&quot;</span>',
  );
  expect(result).not.toContain('<span class="hljs-attr">to_server</span>');
});

test("snort highlights the file protocol and rules-file directives", () => {
  const result = highlight(
    'alert file (msg:"pdf"; file_type:"PDF"; sid:1;)\nvar HOME_NET 10.0.0.0/8\nipvar EXTERNAL_NET !$HOME_NET\ninclude $RULE_PATH/local.rules',
  );

  expect(result).toContain('<span class="hljs-type">file</span>');
  expect(result).toContain('<span class="hljs-attr">file_type</span>');
  expect(result).toContain('<span class="hljs-keyword">var</span> HOME_NET');
  expect(result).toContain('<span class="hljs-keyword">ipvar</span>');
  expect(result).toContain('<span class="hljs-keyword">include</span>');
});
