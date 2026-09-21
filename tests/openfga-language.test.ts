import { createRegistry } from "../src/engine.js";

import openfga from "../src/languages/openfga";

const registry = createRegistry();

registry.register(openfga.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "openfga" }).value;

test("openfga highlights model and schema version declarations", () => {
  const result = highlight("model\n  schema 1.1");

  expect(result).toContain('<span class="hljs-keyword">model</span>');
  expect(result).toContain('<span class="hljs-keyword">schema</span>');
  expect(result).toContain('<span class="hljs-number">1.1</span>');
});

test("openfga highlights type declarations with the name as title.class", () => {
  const result = highlight("type document");

  expect(result).toContain('<span class="hljs-keyword">type</span>');
  expect(result).toContain('<span class="hljs-title class_">document</span>');
});

test("openfga highlights define declarations with the name as title.function", () => {
  const result = highlight("define viewer: [user]");

  expect(result).toContain('<span class="hljs-keyword">define</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">viewer</span>',
  );
});

test("openfga highlights the or, from, and but-not operators", () => {
  const result = highlight(
    "define viewer: [user] or owner or member from organization\ndefine can_share: viewer but not owner",
  );

  expect(result).toContain('<span class="hljs-keyword">or</span>');
  expect(result).toContain('<span class="hljs-keyword">from</span>');
  expect(result).toContain('<span class="hljs-keyword">but not</span>');
});

test("openfga highlights typed wildcards and relation references inside type restrictions", () => {
  const result = highlight("define viewer: [user, user:*, team#member]");

  expect(result).toContain('<span class="hljs-operator">:*</span>');
  expect(result).toContain('<span class="hljs-operator">#</span>');
  expect(result).toContain('<span class="hljs-title class_">team</span>');
});

test("openfga does not mis-tag a relation name used elsewhere as a type", () => {
  const result = highlight(
    "type organization\n  relations\n    define member: [user]",
  );

  expect(result).not.toContain(
    '<span class="hljs-title class_">member</span>',
  );
});
