import { createRegistry } from "../src/engine.js";

import hocon from "../src/languages/hocon";

const registry = createRegistry();

registry.register(hocon.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "hocon" }).value;

test("hocon highlights dotted keys as attrs", () => {
  const result = highlight("db.url = value");

  expect(result).toContain('<span class="hljs-attr">db.url</span>');
});

test("hocon highlights the append operator with relevance", () => {
  const result = highlight("db.retries += 1");

  expect(result).toContain('<span class="hljs-operator">+=</span>');
});

test("hocon highlights optional substitutions with high relevance", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: ${?DATABASE_URL} is HOCON syntax, not JS interpolation
  const result = highlight("db.url = ${?DATABASE_URL}");

  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: ${?DATABASE_URL} is HOCON syntax, not JS interpolation
    '<span class="hljs-variable">${?DATABASE_URL}</span>',
  );
});

test("hocon highlights include with required/classpath built-ins", () => {
  const result = highlight('include required(classpath("defaults.conf"))');

  expect(result).toContain('<span class="hljs-keyword">include</span>');
  expect(result).toContain('<span class="hljs-built_in">required</span>');
  expect(result).toContain('<span class="hljs-built_in">classpath</span>');
});

test("hocon highlights durations and sizes as numbers", () => {
  const result = highlight("timeout = 30s\nmax-size = 512k");

  expect(result).toContain('<span class="hljs-number">30s</span>');
  expect(result).toContain('<span class="hljs-number">512k</span>');
});

test("hocon highlights literals and comments", () => {
  const result = highlight("# a comment\nenabled = true");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
});
