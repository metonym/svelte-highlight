import { createRegistry, registerAll } from "../src/engine.js";

import tsrx from "../src/languages/tsrx";
import { tsrxKitchenSink } from "../www/preview/tsrx-kitchen-sink";

const registry = createRegistry();

registerAll(registry, tsrx);

const highlight = (code: string) =>
  registry.highlight(code, { language: "tsrx" }).value;

const greetingSnippet = `export function Greeting({ name }: { name?: string }) @{
  const message = name ? \`Hello, \${name}\` : "Hello, stranger";

  <>
    <div class="card">
      <p>{message}</p>
    </div>

    <style>
      .card { padding: 1rem; }
    </style>
  </>
}`;

const controlFlowSnippet = `function UserList({ users, showBio }: Props) @{
  @for (const user of users) {
    const role = user.admin ? "Admin" : "Member";

    <div class="user-row">
      <strong>{user.name}</strong>
      <span>{role}</span>
      @if (showBio && user.bio) {
        <p>{user.bio}</p>
      } @else {
        <p>No bio</p>
      }
    </div>
  } @empty {
    <p>No users</p>
  }
}`;

const lazyPropsSnippet = `function Counter(&{ count, label }: Props) @{
  <section>
    <h2>{label}</h2>
    <p>Count: {count}</p>
  </section>
}`;

test("tsrx highlights statement containers and TypeScript setup", () => {
  const result = highlight(greetingSnippet);

  expect(result).toContain('<span class="hljs-keyword">@{</span>');
  expect(result).toContain('<span class="hljs-keyword">function</span>');
  expect(result).toContain('<span class="hljs-keyword">const</span>');
  expect(result).toContain("language-typescript");
});

test("tsrx highlights scoped style blocks as CSS", () => {
  const result = highlight(greetingSnippet);

  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">style</span>&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;/<span class="hljs-name">style</span>&gt;</span>',
  );
});

test("tsrx highlights template control-flow directives", () => {
  const result = highlight(controlFlowSnippet);

  expect(result).toContain('<span class="hljs-keyword">@for</span>');
  expect(result).toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain('<span class="hljs-keyword">@else</span>');
  expect(result).toContain('<span class="hljs-keyword">@empty</span>');
});

test("tsrx highlights lazy prop destructure", () => {
  const result = highlight(lazyPropsSnippet);

  expect(result).toContain('<span class="hljs-keyword">&amp;{</span>');
});

test("tsrx highlights statement-level JSX tags and attributes", () => {
  const result = highlight(greetingSnippet);

  expect(result).toContain("language-xml");
  expect(result).toContain('<span class="hljs-tag">&lt;&gt;</span>');
  expect(result).toContain('<span class="hljs-name">div</span>');
  expect(result).toContain('<span class="hljs-attr">class</span>');
  expect(result).toContain('<span class="hljs-name">p</span>');
});

test("tsrx still highlights directives nested inside JSX", () => {
  const result = highlight(controlFlowSnippet);

  expect(result).toContain('<span class="hljs-keyword">@for</span>');
  expect(result).toContain('<span class="hljs-keyword">@if</span>');
  expect(result).toContain('<span class="hljs-name">div</span>');
  expect(result).toContain('<span class="hljs-name">p</span>');
});

test("tsrx does not treat JSX text as a TypeScript class", () => {
  const result = highlight("<p>Loading stats</p>");

  expect(result).toContain("Loading stats");
  expect(result).not.toContain(
    '<span class="hljs-title class_">Loading</span>',
  );
});

test("tsrx does not treat TypeScript generics as JSX tags", () => {
  const result = highlight("const m: Map<string, Array<number>> = new Map();");

  expect(result).not.toContain("hljs-tag");
  expect(result).not.toContain("language-xml");
});

test("tsrx does not treat a comparison as a JSX tag", () => {
  const result = highlight("const cmp = a < b > c;");

  expect(result).not.toContain("hljs-tag");
});

test("tsrx does not tag TypeScript decorators as directives", () => {
  const result = highlight("@Component()\nclass App {}");

  expect(result).not.toContain('<span class="hljs-keyword">@Component</span>');
});

test("tsrx does not treat spaced ampersand as lazy destructure", () => {
  const result = highlight("const x = a & { y: 1 };");

  expect(result).not.toContain('<span class="hljs-keyword">&amp;{</span>');
});

test("tsrx kitchen sink highlights tags, directives, and CSS", () => {
  const result = highlight(tsrxKitchenSink);

  expect(result).toContain('<span class="hljs-keyword">@{</span>');
  expect(result).toContain('<span class="hljs-keyword">&amp;{</span>');
  expect(result).toContain('<span class="hljs-keyword">&amp;[</span>');
  expect(result).toContain('<span class="hljs-keyword">@for</span>');
  expect(result).toContain('<span class="hljs-keyword">@switch</span>');
  expect(result).toContain('<span class="hljs-keyword">@try</span>');
  expect(result).toContain('<span class="hljs-keyword">@pending</span>');
  expect(result).toContain('<span class="hljs-name">header</span>');
  expect(result).toContain(
    '<span class="hljs-tag">&lt;/<span class="hljs-name">style</span>&gt;</span>',
  );
  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-class");
});
