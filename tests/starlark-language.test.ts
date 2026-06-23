import hljs from "highlight.js/lib/core";
import starlark from "../src/languages/starlark";

hljs.registerLanguage(starlark.name, starlark.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "starlark" }).value;

test("starlark highlights def declarations", () => {
  const result = highlight("def my_rule(name):\n    pass");

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain('<span class="hljs-title function_">my_rule</span>');
});

test("starlark highlights literals", () => {
  const result = highlight("enabled = True");

  expect(result).toContain('<span class="hljs-literal">True</span>');
});

test("starlark highlights build built-ins", () => {
  const result = highlight('srcs = glob(["*.go"])');

  expect(result).toContain('<span class="hljs-built_in">glob</span>');
});

test("starlark highlights hash comments and strings", () => {
  const result = highlight('# a comment\nname = "lib"');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-string">&quot;lib&quot;</span>');
});
