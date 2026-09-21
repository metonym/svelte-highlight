import { createRegistry } from "../src/engine.js";

import choicescript from "../src/languages/choicescript";

const registry = createRegistry();

registry.register(choicescript.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "choicescript" }).value;

test("choicescript highlights *if as a keyword", () => {
  const result = highlight("*if (strength > 50)");

  expect(result).toContain('<span class="hljs-keyword">if</span>');
});

test("choicescript highlights *set with an operator", () => {
  const result = highlight("*set courage +10");

  expect(result).toContain('<span class="hljs-keyword">set</span>');
  expect(result).toContain('<span class="hljs-operator">+</span>');
});

test("choicescript highlights expression keywords scoped to the command line", () => {
  const result = highlight("*if (leadership > 5) and not (honesty < 2)");

  expect(result).toContain('<span class="hljs-keyword">and</span>');
  expect(result).toContain('<span class="hljs-keyword">not</span>');
});

test("choicescript highlights #option markers as bullets", () => {
  const result = highlight("*choice\n    #Fight the dragon.");

  expect(result).toContain('<span class="hljs-bullet">    #</span>');
});

test("choicescript highlights variable interpolation", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: ChoiceScript's own ${} interpolation syntax, not a JS template literal
  const result = highlight('"Leadership: ${leadership}"');

  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: ChoiceScript's own ${} interpolation syntax, not a JS template literal
    '<span class="hljs-template-variable">${leadership}</span>',
  );
});

test("choicescript highlights *comment lines as comments", () => {
  const result = highlight("*comment this is a note to myself");

  expect(result).toContain(
    '<span class="hljs-comment">*comment this is a note to myself</span>',
  );
});

test("choicescript does not treat a Markdown bullet as a command", () => {
  const result = highlight("* just a list item");

  expect(result).not.toContain('class="hljs-keyword"');
});

test("choicescript does not treat Markdown emphasis as a command", () => {
  const result = highlight("*text*");

  expect(result).not.toContain('class="hljs-keyword"');
});
