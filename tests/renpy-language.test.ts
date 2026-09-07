import { createRegistry } from "../src/engine.js";

import renpy from "../src/languages/renpy";

const registry = createRegistry();

registry.register(renpy.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "renpy" }).value;

test("renpy highlights label declarations with the name as title.function", () => {
  const result = highlight("label start:");

  expect(result).toContain('<span class="hljs-keyword">label</span>');
  expect(result).toContain('<span class="hljs-title function_">start</span>');
});

test("renpy highlights statement keywords", () => {
  const result = highlight("scene bg room\nshow eileen happy at left");

  expect(result).toContain('<span class="hljs-keyword">scene</span>');
  expect(result).toContain('<span class="hljs-keyword">show</span>');
  expect(result).toContain('<span class="hljs-keyword">at</span>');
});

test("renpy highlights dialogue speaker and text tags", () => {
  const result = highlight('e "Hello, {b}world{/b}!"');

  expect(result).toContain('<span class="hljs-title class_">e</span>');
  expect(result).toContain('<span class="hljs-tag">{b}</span>');
  expect(result).toContain('<span class="hljs-tag">{/b}</span>');
});

test("renpy highlights variable interpolation", () => {
  const result = highlight('e "You have [gold] gold pieces."');

  expect(result).toContain(
    '<span class="hljs-template-variable">[gold]</span>',
  );
});

test("renpy highlights $ python lines with high relevance", () => {
  const result = highlight("$ gold = gold + 10");

  expect(result).toContain('<span class="hljs-meta">$</span>');
});

test("renpy highlights screen actions as built-ins and comments", () => {
  const result = highlight("# a comment\naction Return()");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-built_in">Return</span>');
});
