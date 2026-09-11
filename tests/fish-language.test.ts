import { createRegistry } from "../src/engine.js";

import fish from "../src/languages/fish";

const registry = createRegistry();

registry.register(fish.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "fish" }).value;

test("fish highlights keywords", () => {
  const result = highlight("if test -f file\n  echo found\nend");

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">end</span>');
});

test("fish highlights builtins", () => {
  const result = highlight("set name value\necho $name");

  expect(result).toContain('<span class="hljs-built_in">set</span>');
  expect(result).toContain('<span class="hljs-built_in">echo</span>');
});

test("fish highlights function definitions", () => {
  const result = highlight("function greet\n  echo hi\nend");

  expect(result).toContain('<span class="hljs-keyword">function</span>');
  expect(result).toContain('<span class="hljs-title function_">greet</span>');
});

test("fish highlights variables", () => {
  const result = highlight("echo $HOME");

  expect(result).toContain('<span class="hljs-variable">$HOME</span>');
});

test("fish highlights strings with interpolation", () => {
  const result = highlight('echo "hi $name"');

  expect(result).toContain("hljs-string");
  expect(result).toContain('<span class="hljs-variable">$name</span>');
});

test("fish highlights bare command substitution", () => {
  const result = highlight("set files (ls *.txt)\necho (count $files)");

  expect(result).toContain('<span class="hljs-subst">(ls *.txt)</span>');
  expect(result).toContain(
    '<span class="hljs-subst">(count <span class="hljs-variable">$files</span>)</span>',
  );
});

test("fish only styles the function name as a title, not its options", () => {
  const result = highlight(
    'function greet --argument-names who -d "say hi"\n    echo $who\nend',
  );

  expect(result).toContain(
    '<span class="hljs-keyword">function</span> <span class="hljs-title function_">greet</span> --argument-names who -d <span class="hljs-string">&quot;say hi&quot;</span>',
  );
  expect(result).not.toContain('<span class="hljs-title function_">who</span>');
});
