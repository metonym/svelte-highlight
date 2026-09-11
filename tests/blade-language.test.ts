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

test("blade strings don't end early on an escaped quote", () => {
  const result = highlight('{{ "Say \\"hi\\" to me" }}');

  expect(result).toContain(
    '<span class="hljs-string">&quot;Say \\&quot;hi\\&quot; to me&quot;</span>',
  );
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

test("blade does not mistake an email address for a directive", () => {
  const result = highlight(
    "Contact us at foo@example.com\n@if($user)\nHi\n@endif",
  );

  expect(result).toContain("foo@example.com");
  expect(result).not.toContain(
    '<span class="hljs-keyword">@example.com</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain('<span class="hljs-keyword">@endif</span>');
});

test("blade highlights @php blocks as PHP even when not at the start of the file", () => {
  const result = highlight("<div>\n@php\n  $total = 1 + 2;\n@endphp\n</div>");

  expect(result).toContain("language-php");
  expect(result).toContain('<span class="hljs-keyword">@php</span>');
  expect(result).toContain('<span class="hljs-keyword">@endphp</span>');
});

test("blade treats inline @php(...) as a directive, not a block opener", () => {
  const result = highlight(
    "@php($count = 1)\n<p>{{ $count }}</p>\n@php\n  $x = 2;\n@endphp\n<p>{{ $x }}</p>",
  );

  // Both echoes stay Blade echoes: the inline form must not swallow the
  // markup between it and the real block's `@endphp`.
  expect(result).toContain(
    '<span class="hljs-template-variable">{{ <span class="hljs-variable">$count</span> }}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-variable">{{ <span class="hljs-variable">$x</span> }}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">@php</span><span class="language-php">',
  );
  expect(result).toContain('<span class="hljs-keyword">@endphp</span>');
});

test("blade styles a same-line @endphp as a keyword", () => {
  const result = highlight("<p>@php $x = 1; @endphp</p>");

  expect(result).toContain("language-php");
  expect(result).toContain('<span class="hljs-keyword">@endphp</span>');
});

test("blade keeps @verbatim bodies as plain markup", () => {
  const result = highlight(
    "@verbatim\n  <div>{{ raw }} @if</div>\n@endverbatim\n{{ $real }} @endverbatim",
  );

  expect(result).toContain('<span class="hljs-keyword">@verbatim</span>');
  expect(result).toContain('<span class="hljs-keyword">@endverbatim</span>');
  expect(result).not.toContain(
    '<span class="hljs-template-variable">{{ raw }}</span>',
  );
  expect(result).not.toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">{{ <span class="hljs-variable">$real</span> }}</span>',
  );
});

test("blade styles escaped @@directives as meta", () => {
  const result = highlight("@@if(true) @if($x) foo@@bar @endif");

  expect(result).toContain('<span class="hljs-meta">@@if</span>');
  expect(result).toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain('<span class="hljs-keyword">@endif</span>');
  expect(result).not.toContain('<span class="hljs-meta">@@bar</span>');
});
