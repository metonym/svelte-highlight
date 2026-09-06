import { createRegistry } from "../src/engine.js";

import modelfile from "../src/languages/modelfile";

const registry = createRegistry();

registry.register(modelfile.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "modelfile" }).value;

test("modelfile highlights the FROM instruction", () => {
  const result = highlight("FROM llama3.2");

  expect(result).toContain('<span class="hljs-keyword">FROM</span>');
});

test("modelfile highlights parameter names after PARAMETER", () => {
  const result = highlight("PARAMETER temperature 0.7");

  expect(result).toContain('<span class="hljs-keyword">PARAMETER</span>');
  expect(result).toContain('<span class="hljs-attr">temperature</span>');
});

test("modelfile highlights roles after MESSAGE", () => {
  const result = highlight("MESSAGE user Hello!");

  expect(result).toContain('<span class="hljs-keyword">MESSAGE</span>');
  expect(result).toContain('<span class="hljs-literal">user</span>');
});

test("modelfile highlights template variables inside triple-quoted strings", () => {
  const result = highlight('TEMPLATE """{{ .Prompt }}"""');

  expect(result).toContain(
    '<span class="hljs-template-variable">{{ .Prompt }}</span>',
  );
});

test("modelfile is case-insensitive for instructions", () => {
  const result = highlight("from llama3.2");

  expect(result).toContain('<span class="hljs-keyword">from</span>');
});
