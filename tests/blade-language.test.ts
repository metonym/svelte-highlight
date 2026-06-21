import hljs from "highlight.js/lib/core";
import blade from "../src/languages/blade";

hljs.registerLanguage(blade.name, blade.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "blade" }).value;

test("blade highlights directives", () => {
  const result = highlight("@if($user)\n@endif");

  expect(result).toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain('<span class="hljs-keyword">@endif</span>');
});

test("blade highlights echo statements", () => {
  const result = highlight("{{ $user->name }}");

  expect(result).toContain("hljs-template-variable");
  expect(result).toContain('<span class="hljs-variable">$user</span>');
});

test("blade highlights raw echo statements", () => {
  const result = highlight("{!! $html !!}");

  expect(result).toContain("hljs-template-variable");
});

test("blade highlights comments", () => {
  const result = highlight("{{-- a comment --}}");

  expect(result).toContain("hljs-comment");
});

test("blade delegates surrounding markup to xml", () => {
  const result = highlight("<p>{{ $name }}</p>");

  expect(result).toContain("hljs-tag");
});
