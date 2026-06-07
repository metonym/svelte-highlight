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

test("html alone does not highlight marko expressions", () => {
  const isolated = hljs.newInstance();
  isolated.registerLanguage(html.name, html.register);

  const result = isolated.highlight(expressionSnippet, {
    language: "html",
  }).value;

  expect(result).not.toContain("language-javascript");
});
