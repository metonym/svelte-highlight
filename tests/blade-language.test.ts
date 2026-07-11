import { createRegistry, registerAll } from "../src/engine.js";

import blade from "../src/languages/blade";

const registry = createRegistry();

registerAll(registry, blade);

const highlight = (code: string) =>
  registry.highlight(code, { language: "blade" }).value;

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

test("blade highlights variables and strings inside directive parens", () => {
  const result = highlight("@if($user->isAdmin())\n@endif");

  expect(result).toContain('<span class="hljs-variable">$user</span>');

  const foreachResult = highlight(
    "@foreach($items as $item)\n  {{ $item }}\n@endforeach",
  );

  expect(foreachResult).toContain('<span class="hljs-variable">$items</span>');
  expect(foreachResult).toContain('<span class="hljs-variable">$item</span>');

  const stringResult = highlight("@if($status === 'active')\n@endif");

  expect(stringResult).toContain(
    '<span class="hljs-string">&#x27;active&#x27;</span>',
  );
});

test("blade highlights @php blocks as PHP", () => {
  const result = highlight("@php\n  $total = 1 + 2;\n@endphp");

  expect(result).toContain("language-php");
  expect(result).toContain('<span class="hljs-variable">$total</span>');
  expect(result).toContain('<span class="hljs-keyword">@php</span>');
  expect(result).toContain('<span class="hljs-keyword">@endphp</span>');
});

test("blade treats @{{ }} as an escaped literal, not a real echo", () => {
  const result = highlight("@{{ raw }}");

  expect(result).not.toContain("hljs-template-variable");
  expect(result).toContain('<span class="hljs-meta">@{{ raw }}</span>');
});
