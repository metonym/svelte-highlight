import { createRegistry } from "../src/engine.js";

import bicep from "../src/languages/bicep";

const registry = createRegistry();

registry.register(bicep.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bicep" }).value;

test("bicep highlights declaration keywords", () => {
  const result = highlight("param location string");

  expect(result).toContain('<span class="hljs-keyword">param</span>');
  expect(result).toContain('<span class="hljs-type">string</span>');
});

test("bicep highlights single-quoted strings", () => {
  const result = highlight("param location string = 'eastus'");

  expect(result).toContain(
    '<span class="hljs-string">&#x27;eastus&#x27;</span>',
  );
});

test("bicep highlights decorators as meta", () => {
  const result = highlight("@secure()\nparam pw string");

  expect(result).toContain('<span class="hljs-meta">@secure</span>');
});

test("bicep highlights resource type references", () => {
  const result = highlight(
    "resource sa 'Microsoft.Storage/storageAccounts@2021-09-01' = {}",
  );

  expect(result).toContain('<span class="hljs-keyword">resource</span>');
  expect(result).toContain(
    '<span class="hljs-type">&#x27;Microsoft.Storage/storageAccounts@2021-09-01&#x27;</span>',
  );
});

test("bicep highlights declaration names as title", () => {
  const result = highlight(
    "resource myStorage 'Microsoft.Storage/storageAccounts@2021-09-01' = {}",
  );

  expect(result).toContain('<span class="hljs-title">myStorage</span>');
});
