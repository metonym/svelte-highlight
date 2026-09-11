import { createRegistry } from "../src/engine.js";

import roc from "../src/languages/roc";

const registry = createRegistry();

registry.register(roc.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "roc" }).value;

test("roc highlights the app header as the relevance carrier", () => {
  const result = highlight('app [main] { pf: platform "https://example.com" }');

  expect(result).toContain('<span class="hljs-meta">app [main]</span>');
});

test("roc highlights tags as class titles", () => {
  const result = highlight('Ok _ -> Stdout.line "done"');

  expect(result).toContain('<span class="hljs-title class_">Ok</span>');
  expect(result).toContain('<span class="hljs-title class_">Stdout</span>');
});

test("roc highlights backpassing and arrow operators", () => {
  const result = highlight("result <- Task.await task");

  expect(result).toContain('<span class="hljs-operator">&lt;-</span>');
});

test("roc highlights string interpolation", () => {
  const result = highlight('"Hello, $(name)!"');

  expect(result).toContain('<span class="hljs-subst">$(name)</span>');
});

test("roc highlights keywords and built-ins", () => {
  const result = highlight("when result is\n  _ -> dbg result");

  expect(result).toContain('<span class="hljs-keyword">when</span>');
  expect(result).toContain('<span class="hljs-keyword">is</span>');
  expect(result).toContain('<span class="hljs-built_in">dbg</span>');
});

test("roc highlights dollar-brace interpolation and and/or/match", () => {
  const interp = "$" + "{name}";
  const result = highlight(
    'match n {\n  _ => "Hello, ' +
      interp +
      '!"\n}\nif a and b or c then crash ""\n',
  );

  expect(result).toContain('<span class="hljs-keyword">match</span>');
  expect(result).toContain('<span class="hljs-keyword">and</span>');
  expect(result).toContain('<span class="hljs-keyword">or</span>');
  expect(result).toContain('<span class="hljs-operator">=&gt;</span>');
  expect(result).toContain('<span class="hljs-subst">$' + "{name}</span>");
});

test("roc highlights effectful names and the ?? operator", () => {
  const result = highlight("n = I64.from_str(first) ?? 0\necho!(n)");

  expect(result).toContain('<span class="hljs-operator">??</span>');
  expect(result).toContain('<span class="hljs-title function_">echo!</span>');
});

test("roc still interpolates $(name) and does not treat android as and", () => {
  const result = highlight('msg = "Hello, $(name)!"\nandroid = 1');

  expect(result).toContain('<span class="hljs-subst">$(name)</span>');
  expect(result).toContain("android =");
  expect(result).not.toContain('<span class="hljs-keyword">and</span>roid');
});
