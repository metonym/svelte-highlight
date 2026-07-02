import hljs from "highlight.js/lib/core";
import html from "svelte-highlight/languages/html";
import marko from "../src/languages/marko";

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
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(expressionSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
});

test("marko highlights script blocks as JavaScript", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(scriptSnippet, { language: "marko" }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-title function_");
});

test("marko highlights style blocks as CSS", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(styleSnippet, { language: "marko" }).value;

  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain("language-html");
});

test("marko highlights control flow keywords", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(controlFlowSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-keyword">');
  expect(result).toContain("if</span>");
  expect(result).toContain("else</span>");
});

test("marko highlights class components and event attributes", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(classComponentSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain('<span class="hljs-variable">on-click</span>');
  expect(result).toContain("language-javascript");
});

test("marko highlights concise-mode tag names and attributes", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(conciseTagSnippet, {
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
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(conciseTagSnippet, {
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
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(classComponentSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain(
    '<span class="language-javascript"><span class="hljs-keyword">class</span>',
  );
});

test("marko highlights input/state/out as implicit template variables", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(conciseTagSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-built_in">input</span>');
  expect(result).toContain('<span class="hljs-built_in">state</span>');
});

test("marko highlights a bare concise tag with indented children", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(conciseParentSnippet, {
    language: "marko",
  }).value;

  expect(result).toContain('<span class="hljs-name">div</span>');
  expect(result).toContain('<span class="hljs-name">h1</span>');
  expect(result).toContain('<span class="hljs-name">span</span>');
});

test("marko does not mistake plain text inside a full <tag> for a concise tag", () => {
  hljs.registerLanguage(marko.name, marko.register);

  const result = hljs.highlight(expressionSnippet, {
    language: "marko",
  }).value;

  expect(result).not.toContain('<span class="hljs-name">Hello</span>');
  expect(result).toContain("language-javascript");
});

test("html alone does not highlight marko expressions", () => {
  const isolated = hljs.newInstance();
  isolated.registerLanguage(html.name, html.register);

  const result = isolated.highlight(expressionSnippet, {
    language: "html",
  }).value;

  expect(result).not.toContain("language-javascript");
});
