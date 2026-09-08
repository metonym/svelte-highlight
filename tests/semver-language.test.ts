import { createRegistry } from "../src/engine.js";

import semver from "../src/languages/semver";

const registry = createRegistry();

registry.register(semver.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "semver" }).value;

test("semver highlights the major.minor.patch triplet as numbers", () => {
  const result = highlight("1.2.3");

  expect(result).toContain('<span class="hljs-number">1</span>');
  expect(result).toContain('<span class="hljs-number">2</span>');
  expect(result).toContain('<span class="hljs-number">3</span>');
});

test("semver highlights a prerelease suffix as symbol", () => {
  const result = highlight("2.1.0-alpha.1");

  expect(result).toContain('<span class="hljs-symbol">-alpha.1</span>');
});

test("semver highlights build metadata as meta", () => {
  const result = highlight("1.0.0+build.123");

  expect(result).toContain('<span class="hljs-meta">+build.123</span>');
});

test("semver highlights comparator operators", () => {
  const result = highlight(">=1.2.7 <1.3.0 || ^2.0.0 ~2.1.0");

  expect(result).toContain('<span class="hljs-operator">&gt;=</span>');
  expect(result).toContain('<span class="hljs-operator">&lt;</span>');
  expect(result).toContain('<span class="hljs-operator">||</span>');
  expect(result).toContain('<span class="hljs-operator">^</span>');
  expect(result).toContain('<span class="hljs-operator">~</span>');
});

test("semver highlights a hyphen range separator as an operator", () => {
  const result = highlight("1.0.0 - 2.9.9");

  expect(result).toContain('<span class="hljs-operator">-</span>');
});

test("semver highlights x/X/* wildcards as operators", () => {
  const result = highlight("1.2.x 1.X.3 *");

  const operatorCount = (
    result.match(/<span class="hljs-operator">[xX*]<\/span>/g) ?? []
  ).length;

  expect(operatorCount).toBe(3);
});
