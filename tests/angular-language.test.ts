import { createRegistry, registerAll } from "../src/engine.js";

import angular from "../src/languages/angular";

const registry = createRegistry();

registerAll(registry, angular);

const highlight = (code: string) =>
  registry.highlight(code, { language: "angular" }).value;

test("angular highlights built-in control flow", () => {
  const result = highlight(
    `@if (user) {
  <p>{{ user.name }}</p>
} @else {
  <p>Guest</p>
}`,
  );

  expect(result).toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain('<span class="hljs-keyword">@else</span>');
  expect(result).toContain("language-javascript");
});

test("angular highlights @for with track and @empty", () => {
  const result = highlight(
    `@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <p>None</p>
}`,
  );

  expect(result).toContain('<span class="hljs-keyword">@for</span>');
  expect(result).toContain('<span class="hljs-keyword">@empty</span>');
});

test("angular highlights @defer blocks", () => {
  const result = highlight(
    `@defer {
  <heavy-cmp />
} @placeholder {
  <p>Loading</p>
}`,
  );

  expect(result).toContain('<span class="hljs-keyword">@defer</span>');
  expect(result).toContain('<span class="hljs-keyword">@placeholder</span>');
});

test("angular highlights structural directives and two-way bindings", () => {
  const result = highlight(
    `<input *ngIf="visible" [(ngModel)]="name" (click)="save()" [class.active]="on" #field />`,
  );

  expect(result).toContain('<span class="hljs-keyword">*ngIf</span>');
  expect(result).toContain('<span class="hljs-variable">[(ngModel)]</span>');
  expect(result).toContain('<span class="hljs-variable">(click)</span>');
  expect(result).toContain('<span class="hljs-variable">[class.active]</span>');
  expect(result).toContain('<span class="hljs-symbol">#field</span>');
});

test("angular highlights interpolation as JavaScript", () => {
  const result = highlight("<h1>{{ title }}</h1>");

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-tag");
});

test("angular highlights @let declarations", () => {
  const result = highlight(
    "@let total = items().length + 1;\n<p>{{ total }}</p>\n@let $user = user$ | async;",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">@let</span> <span class="hljs-variable">total</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">@let</span> <span class="hljs-variable">$user</span>',
  );
  // The initializer is JavaScript up to the `;`.
  expect(result).toContain(
    '<span class="language-javascript"> = <span class="hljs-title function_">items</span>().<span class="hljs-property">length</span> + <span class="hljs-number">1</span></span>',
  );
  expect(result).not.toContain('<span class="hljs-variable">user$');
});

test("angular highlights block parameters as JavaScript", () => {
  const result = highlight(
    `@if (user.isLoggedIn) {
} @else if (count > 1) {
}
@switch (mode) {
  @case ("admin") { }
}`,
  );

  expect(result).toContain(
    '<span class="hljs-keyword">@if</span> (<span class="language-javascript">user.<span class="hljs-property">isLoggedIn</span></span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">@else if</span> (<span class="language-javascript">count &gt; <span class="hljs-number">1</span></span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">&quot;admin&quot;</span>',
  );
});

test("angular highlights @for and @defer clause keywords", () => {
  const result = highlight(
    `@for (item of items; track item.id; let i = $index) {
}
@defer (on viewport; prefetch on idle) {
} @placeholder (minimum 500ms) {
}
@defer (when isReady(); hydrate never) {}`,
  );

  for (const word of [
    "of",
    "track",
    "let",
    "on",
    "prefetch",
    "minimum",
    "when",
    "hydrate",
    "never",
  ]) {
    expect(result).toContain(`<span class="hljs-keyword">${word}</span>`);
  }
  expect(result).toContain('<span class="hljs-title function_">isReady</span>');
});

test("angular keeps clause words as variables in a condition", () => {
  const result = highlight("@if (on) {}\n@if (track && after) {}");

  expect(result).not.toContain('<span class="hljs-keyword">on</span>');
  expect(result).not.toContain('<span class="hljs-keyword">track</span>');
  expect(result).not.toContain('<span class="hljs-keyword">after</span>');
});

test("angular closes block parameters at their own paren", () => {
  const result = highlight("@if (check((a) + 1)) {\n  <p>ok</p>\n}");

  expect(result).toContain('<span class="hljs-title function_">check</span>');
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">p</span>',
  );
});

test("angular leaves non-@let at-words alone", () => {
  const result = highlight("<div @fadeIn>@letter @if</div>");

  expect(result).not.toContain('<span class="hljs-keyword">@let</span>');
  expect(result).not.toContain("hljs-variable");
  expect(result).toContain('<span class="hljs-keyword">@if</span>');
});
