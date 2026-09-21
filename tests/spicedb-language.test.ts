import { createRegistry } from "../src/engine.js";

import spicedb from "../src/languages/spicedb";

const registry = createRegistry();

registry.register(spicedb.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "spicedb" }).value;

test("spicedb highlights definition declarations with the name as title.class", () => {
  const result = highlight("definition document {}");

  expect(result).toContain('<span class="hljs-keyword">definition</span>');
  expect(result).toContain('<span class="hljs-title class_">document</span>');
});

test("spicedb highlights caveat declarations with the name as title.function", () => {
  const result = highlight(
    'caveat has_valid_ip(user_ip ipaddress) {\n  user_ip.in_cidr("192.168.0.0/16")\n}',
  );

  expect(result).toContain('<span class="hljs-keyword">caveat</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">has_valid_ip</span>',
  );
});

test("spicedb highlights relation and permission declarations", () => {
  const result = highlight("relation viewer: user\npermission view = viewer");

  expect(result).toContain('<span class="hljs-keyword">relation</span>');
  expect(result).toContain('<span class="hljs-attr">viewer</span>');
  expect(result).toContain('<span class="hljs-keyword">permission</span>');
  expect(result).toContain('<span class="hljs-attr">view</span>');
});

test("spicedb highlights the union, exclusion, and arrow operators", () => {
  const result = highlight("permission view = viewer + parent->view - banned");

  expect(result).toContain('<span class="hljs-operator">+</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">-</span>');
});

test("spicedb highlights subject type wildcards and relation references", () => {
  const result = highlight("relation viewer: user:* | team#member");

  expect(result).toContain('<span class="hljs-operator">:*</span>');
  expect(result).toContain('<span class="hljs-operator">#</span>');
});

test("spicedb highlights comments and does not style declared names as keywords", () => {
  const result = highlight("// a comment\npermission view = viewer");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).not.toContain('<span class="hljs-keyword">view</span>');
});
