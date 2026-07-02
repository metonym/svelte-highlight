import hljs from "highlight.js/lib/core";
import jsonnet from "../src/languages/jsonnet";

hljs.registerLanguage(jsonnet.name, jsonnet.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "jsonnet" }).value;

test("jsonnet highlights local function declarations", () => {
  const result = highlight("local f(x) = x;");

  expect(result).toContain('<span class="hljs-keyword">local</span>');
  expect(result).toContain('<span class="hljs-title function_">f</span>');
});

test("jsonnet highlights the std library", () => {
  const result = highlight("{ a: std.length([]) }");

  expect(result).toContain('<span class="hljs-built_in">std</span>');
  expect(result).toContain('<span class="hljs-built_in">length</span>');
});

test("jsonnet highlights literals", () => {
  const result = highlight("{ ok: true }");

  expect(result).toContain('<span class="hljs-literal">true</span>');
});

test("jsonnet highlights strings", () => {
  const result = highlight('{ name: "svelte" }');

  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte&quot;</span>',
  );
});

test("jsonnet highlights field-visibility and mixin operators", () => {
  const result = highlight(
    "{ hidden:: 1, forced::: 2, mixin+: 3, mixinHidden+:: 4, normal: 5 }",
  );

  expect(result).toContain('<span class="hljs-operator">::</span>');
  expect(result).toContain('<span class="hljs-operator">:::</span>');
  expect(result).toContain('<span class="hljs-operator">+:</span>');
  expect(result).toContain('<span class="hljs-operator">+::</span>');
  expect(result).toContain("normal: <span");
});

test("jsonnet highlights verbatim strings with doubled-quote escapes", () => {
  const result = highlight('local x = @"say ""hi""";');

  expect(result).toContain(
    '<span class="hljs-string">@&quot;say &quot;&quot;hi&quot;&quot;&quot;</span>',
  );
});
