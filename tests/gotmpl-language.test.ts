import { createRegistry } from "../src/engine.js";

import gotmpl from "../src/languages/gotmpl";

const registry = createRegistry();

registry.register(gotmpl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "gotmpl" }).value;

test("gotmpl highlights the range keyword inside an action", () => {
  const result = highlight("{{ range .Items }}{{ end }}");

  expect(result).toContain('<span class="hljs-keyword">range</span>');
  expect(result).toContain('<span class="hljs-keyword">end</span>');
});

test("gotmpl highlights variables and field access", () => {
  const result = highlight("{{ $name := .Name }}");

  expect(result).toContain('<span class="hljs-variable">$name</span>');
  expect(result).toContain('<span class="hljs-property">.Name</span>');
});

test("gotmpl highlights built-in functions and the pipe operator", () => {
  const result = highlight('{{ .Name | printf "%s" }}');

  expect(result).toContain('<span class="hljs-built_in">printf</span>');
  expect(result).toContain('<span class="hljs-operator">|</span>');
});

test("gotmpl highlights comments", () => {
  const result = highlight("{{- /* a comment */ -}}");

  expect(result).toContain(
    '<span class="hljs-comment">{{- /* a comment */ -}}</span>',
  );
});

test("gotmpl leaves text outside actions unhighlighted", () => {
  const result = highlight("Hello, {{ .Name }}!");

  expect(result).toBe('Hello, {{ <span class="hljs-property">.Name</span> }}!');
});
