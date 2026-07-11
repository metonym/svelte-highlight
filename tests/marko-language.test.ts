import html from "svelte-highlight/languages/html";
import { createRegistry, registerAll } from "../src/engine.js";
import marko from "../src/languages/marko";

const registry = createRegistry();

const expressionSnippet = `<div class=input.className>
  Hello \${input.name}!
</div>`;

const scriptSnippet = `<script>
module.exports = {
  onCreate() {
    this.state = { count: 0 };
  },
};
</script>

<button>\${state.count}</button>`;

const styleSnippet = `<style>
  .card { color: red; }
</style>

<div>Hi</div>`;

const controlFlowSnippet = `<div>
  if (condition)
    p -- Yes
  else
    p -- No
</div>`;

const classComponentSnippet = `class {
  onCreate() {
    this.state = { count: 0 };
  }
}
<button on-click('increment')>
  \${state.count}
</button>`;

const conciseTagSnippet = `<div class=["card", state.visible]>
  if (state.visible)
    h1 -- \${input.title}

    input type="text" value=state.name on-input("updateName") /
    button on-click("increment") -- Count: \${state.count}
</div>`;

const conciseParentSnippet = `div
  h1 -- Title
  span -- Subtitle`;

test("marko highlights dollar-brace expressions as JavaScript", () => {
  registerAll(registry, marko);

  const result = registry.highlight(expressionSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
});

test("marko highlights script blocks as JavaScript", () => {
  registerAll(registry, marko);

  const result = registry.highlight(scriptSnippet, { language: "marko" }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-title function_");
});

test("marko highlights style blocks as CSS", () => {
  registerAll(registry, marko);

  const result = registry.highlight(styleSnippet, { language: "marko" }).value;

  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain("language-html");
});

test("marko highlights control flow keywords", () => {
  registerAll(registry, marko);

  const result = registry.highlight(controlFlowSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-keyword">');
  expect(result).toContain("if</span>");
  expect(result).toContain("else</span>");
});

test("marko highlights class components and event attributes", () => {
  registerAll(registry, marko);

  const result = registry.highlight(classComponentSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain('<span class="hljs-variable">on-click</span>');
  expect(result).toContain("language-javascript");
});

test("marko highlights concise-mode tag names and attributes", () => {
  registerAll(registry, marko);

  const result = registry.highlight(conciseTagSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-name">h1</span>');
  expect(result).toContain('<span class="hljs-name">input</span>');
  expect(result).toContain('<span class="hljs-name">button</span>');
  expect(result).toContain('<span class="hljs-attr">type</span>');
  expect(result).toContain('<span class="hljs-attr">value</span>');
  expect(result).toContain('<span class="hljs-string">&quot;text&quot;</span>');
});

test("marko highlights event handler arguments and dollar-brace expressions on concise tags", () => {
  registerAll(registry, marko);

  const result = registry.highlight(conciseTagSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-variable">on-input</span>');
  expect(result).toContain(
    '<span class="hljs-variable">on-input</span>(<span class="hljs-string">&quot;updateName&quot;</span>)',
  );
  expect(result).toContain(
    '<span class="hljs-variable">on-click</span>(<span class="hljs-string">&quot;increment&quot;</span>)',
  );
  expect(result).toContain("language-javascript");
});

test("marko classifies the top-level class keyword as JavaScript", () => {
  registerAll(registry, marko);

  const result = registry.highlight(classComponentSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain(
    '<span class="language-javascript"><span class="hljs-keyword">class</span>',
  );
});

test("marko highlights input/state/out as implicit template variables", () => {
  registerAll(registry, marko);

  const result = registry.highlight(conciseTagSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-built_in">input</span>');
  expect(result).toContain('<span class="hljs-built_in">state</span>');
});

test("marko highlights a bare concise tag with indented children", () => {
  registerAll(registry, marko);

  const result = registry.highlight(conciseParentSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-name">div</span>');
  expect(result).toContain('<span class="hljs-name">h1</span>');
  expect(result).toContain('<span class="hljs-name">span</span>');
});

test("marko does not mistake plain text inside a full <tag> for a concise tag", () => {
  registerAll(registry, marko);

  const result = registry.highlight(expressionSnippet, {
    language: "marko",
  }).value;

  expect(result).not.toContain('<span class="hljs-name">Hello</span>');
  expect(result).toContain("language-javascript");
});

test("html alone does not highlight marko expressions", () => {
  const isolated = createRegistry();
  registerAll(isolated, html);

  const result = isolated.highlight(expressionSnippet, {
    language: "html",
  }).value;

  expect(result).not.toContain("language-javascript");
});
