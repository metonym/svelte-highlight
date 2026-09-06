import { createRegistry } from "../src/engine.js";

import yang from "../src/languages/yang";

const registry = createRegistry();

registry.register(yang.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "yang" }).value;

test("yang highlights leaf-list and augment as relevance carriers", () => {
  const result = highlight("leaf-list address {\n  type string;\n}");

  expect(result).toContain('<span class="hljs-keyword">leaf-list</span>');
});

test("yang highlights prefixed identifiers as symbols", () => {
  const result = highlight("type inet:ip-address;");

  expect(result).toContain('<span class="hljs-symbol">inet:ip-address</span>');
});

test("yang highlights built-in types", () => {
  const result = highlight("leaf enabled {\n  type boolean;\n}");

  expect(result).toContain('<span class="hljs-type">boolean</span>');
});

test("yang highlights literals", () => {
  const result = highlight("default true;\nstatus deprecated;");

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">deprecated</span>');
});

test("yang highlights comments and strings", () => {
  const result = highlight('// a comment\nnamespace "urn:example:system";');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;urn:example:system&quot;</span>',
  );
});
