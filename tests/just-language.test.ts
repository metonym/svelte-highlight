import hljs from "highlight.js/lib/core";
import just from "../src/languages/just";

hljs.registerLanguage(just.name, just.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "just" }).value;

test("just highlights a recipe with dependencies", () => {
  const result = highlight("test: build\n    cargo test");

  expect(result).toContain(
    '<span class="hljs-title function_"><span class="hljs-title function_ invoke__">test</span></span>:',
  );
});

test("just highlights variable assignment", () => {
  const result = highlight('x := "value"');

  expect(result).toContain('<span class="hljs-variable">x</span>');
  expect(result).toContain('<span class="hljs-operator">:=</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;value&quot;</span>',
  );
});

test("just highlights built-in functions", () => {
  const result = highlight('y := env_var("HOME")');

  expect(result).toContain('<span class="hljs-built_in">env_var</span>');
});

test("just highlights recipe parameters with defaults", () => {
  const result = highlight('build target="release":\n    cargo build');

  expect(result).toContain('<span class="hljs-params">target</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;release&quot;</span>',
  );
});

test("just highlights interpolation in recipe bodies", () => {
  const result = highlight("build target:\n    cargo build --{{target}}");

  expect(result).toContain('<span class="hljs-subst">{{target}}</span>');
});

test("just highlights attributes", () => {
  const result = highlight('[private]\n_setup:\n    echo "setup"');

  expect(result).toContain(
    '<span class="hljs-meta">[<span class="hljs-meta-keyword">private</span>]</span>',
  );
});

test("just highlights comments", () => {
  const result = highlight("# run tests\ntest:\n    cargo test");

  expect(result).toContain('<span class="hljs-comment"># run tests</span>');
});

test("just highlights keywords", () => {
  const result = highlight('export FOO := "bar"');

  expect(result).toContain('<span class="hljs-keyword">export</span>');
});
