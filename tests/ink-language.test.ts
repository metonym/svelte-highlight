import { createRegistry } from "../src/engine.js";

import ink from "../src/languages/ink";

const registry = createRegistry();

registry.register(ink.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "ink" }).value;

test("ink highlights knots with high relevance", () => {
  const result = highlight("=== knot_greeting ===");

  expect(result).toContain(
    '<span class="hljs-section">=== knot_greeting ===</span>',
  );
});

test("ink highlights choice markers and bracketed choice text", () => {
  const result = highlight("* [Ask about the weather]");

  expect(result).toContain('<span class="hljs-bullet">* </span>');
  expect(result).toContain(
    '<span class="hljs-string">[Ask about the weather]</span>',
  );
});

test("ink highlights divert arrows with relevance", () => {
  const result = highlight("-> weather");

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("ink highlights VAR/LIST/INCLUDE keywords with relevance", () => {
  const result = highlight("VAR x = 1");

  expect(result).toContain('<span class="hljs-keyword">VAR</span>');
});

test("ink highlights logic lines and simple interpolation", () => {
  const result = highlight("~ temp x = 5\nHello, {name}!");

  expect(result).toContain('<span class="hljs-meta">~</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">{name}</span>',
  );
});

test("ink highlights inline conditional sequences as subst", () => {
  const result = highlight("{x > 3: warm | cold}");

  expect(result).toContain(
    '<span class="hljs-subst">{x &gt; 3: warm | cold}</span>',
  );
});

test("ink does not treat EXTERNAL arguments as a label", () => {
  const result = highlight("EXTERNAL play_sound(name)");

  expect(result).toContain('<span class="hljs-keyword">EXTERNAL</span>');
  expect(result).not.toContain('<span class="hljs-symbol">(name)</span>');
});

test("ink still highlights a choice label", () => {
  const result = highlight("* (open_door) Open the door");

  expect(result).toContain('<span class="hljs-symbol">(open_door)</span>');
});
