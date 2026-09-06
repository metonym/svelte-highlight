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
