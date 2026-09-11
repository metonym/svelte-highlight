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

test("bicep highlights export, extension, from, and else", () => {
  const result = highlight(
    "export type tags = { env: string }\nimport * as az from 'az@1.0.0'\nextension kubernetes with { kubeConfig: kube } as k8s\nvar n = 1 > 0 ? 1 else 0",
  );

  expect(result).toContain('<span class="hljs-keyword">export</span>');
  expect(result).toContain('<span class="hljs-keyword">extension</span>');
  expect(result).toContain('<span class="hljs-keyword">from</span>');
  expect(result).toContain('<span class="hljs-keyword">else</span>');
  expect(result).toContain('<span class="hljs-title">tags</span>');
});

test("bicep does not treat from inside an identifier as a keyword", () => {
  const result = highlight("var fromCount int = 1");

  expect(result).toContain('<span class="hljs-title">fromCount</span>');
  expect(result).not.toContain('<span class="hljs-keyword">from</span>');
});
