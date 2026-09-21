import { createRegistry } from "../src/engine.js";

import dialog from "../src/languages/dialog";

const registry = createRegistry();

registry.register(dialog.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "dialog" }).value;

test("dialog highlights control-flow tokens as keywords", () => {
  const result = highlight("(if) (bound $Room) (then) (enter $Room) (endif)");

  expect(result).toContain('<span class="hljs-keyword">(if)</span>');
  expect(result).toContain('<span class="hljs-keyword">(then)</span>');
  expect(result).toContain('<span class="hljs-keyword">(endif)</span>');
});

test("dialog highlights directional variables", () => {
  const result = highlight("(interface (name $<Obj))");

  expect(result).toContain('<span class="hljs-variable">$&lt;Obj</span>');
});

test("dialog highlights object and style-class symbols", () => {
  const result = highlight("#foyer\n(room *)\n(style class @status)");

  expect(result).toContain('<span class="hljs-symbol">#foyer</span>');
  expect(result).toContain('<span class="hljs-symbol">@status</span>');
});

test("dialog highlights a negated predicate", () => {
  const result = highlight("~(player can see)");

  expect(result).toContain('<span class="hljs-operator">~</span>');
});

test("dialog highlights line comments", () => {
  const result = highlight("%% Begin the adventure.");

  expect(result).toContain(
    '<span class="hljs-comment">%% Begin the adventure.</span>',
  );
});

test("dialog does not highlight plain Prolog as if it were Dialog", () => {
  const result = highlight("likes(mary, X) :- likes(X, wine).");

  expect(result).not.toContain('class="hljs-variable"');
  expect(result).not.toContain('class="hljs-symbol"');
  expect(result).not.toContain('class="hljs-keyword"');
});
