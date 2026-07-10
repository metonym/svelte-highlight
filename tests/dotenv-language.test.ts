import { createRegistry } from "../src/engine.js";

import dotenv from "../src/languages/dotenv";

const registry = createRegistry();

registry.register(dotenv.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dotenv" }).value;

test("dotenv highlights hash comments", () => {
  const result = highlight("# a comment\nKEY=value");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});

test("dotenv highlights keys as attributes and = as operator", () => {
  const result = highlight("NODE_ENV=production");

  expect(result).toContain('<span class="hljs-attr">NODE_ENV</span>');
  expect(result).toContain('<span class="hljs-operator">=</span>');
});

test("dotenv highlights the export keyword", () => {
  const result = highlight("export AWS_REGION=us-east-1");

  expect(result).toContain('<span class="hljs-keyword">export</span>');
  expect(result).toContain('<span class="hljs-attr">AWS_REGION</span>');
});

test("dotenv highlights quoted strings", () => {
  const result = highlight("TOKEN=\"abc123\"\nRAW='literal'");

  expect(result).toContain(
    '<span class="hljs-string">&quot;abc123&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">&#x27;literal&#x27;</span>',
  );
});

test("dotenv highlights parameter expansion with default/alternate values", () => {
  const result = highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: dotenv uses literal ${VAR:-default} interpolation
    "URL=${HOST:-localhost}\nUSER=${NAME:=guest}\nFLAG=${DEBUG:+on}",
  );

  expect(result).toContain('<span class="hljs-variable">');
  expect(result).toContain('<span class="hljs-operator">:-</span>');
  expect(result).toContain('<span class="hljs-operator">:=</span>');
  expect(result).toContain('<span class="hljs-operator">:+</span>');
});

test("dotenv highlights variable references inside double quotes", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: dotenv uses literal ${VAR} interpolation
  const result = highlight('URL="http://${HOST}:${PORT}"');

  // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting the literal ${HOST} token
  expect(result).toContain('<span class="hljs-variable">${HOST}</span>');
  // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting the literal ${PORT} token
  expect(result).toContain('<span class="hljs-variable">${PORT}</span>');
});
