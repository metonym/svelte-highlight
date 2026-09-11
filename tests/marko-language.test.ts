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

test("marko highlights the else-if hyphen form as one keyword", () => {
  registerAll(registry, marko);

  const result = registry.highlight(
    "if (input.count > 0)\n  p -- Some\nelse-if (input.count === 0)\n  p -- None",
    { language: "marko" },
  ).value;

  expect(result).toContain('<span class="hljs-keyword">else-if</span>');
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

test("marko highlights concise class/id shorthand on tag names", () => {
  registerAll(registry, marko);

  const result = registry.highlight(
    `div.container
  span.title -- Hello
  input#email.required type="email"`,
    { language: "marko" },
  ).value;

  expect(result).toContain('<span class="hljs-name">div.container</span>');
  expect(result).toContain('<span class="hljs-name">span.title</span>');
  expect(result).toContain(
    '<span class="hljs-name">input#email.required</span>',
  );
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

test("marko highlights top-level import/export/static/$ statements as JavaScript", () => {
  registerAll(registry, marko);

  const result = registry.highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
    'import { format } from "./utils";\nexport const limit = 1_000;\nstatic const VERSION = "6";\n$ const greeting = "Hi";\n<div>\${greeting}</div>',
    { language: "marko" },
  ).value;

  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain('<span class="hljs-keyword">export</span>');
  expect(result).toContain('<span class="hljs-keyword">static</span>');
  expect(result).toContain('<span class="hljs-number">1_000</span>');
  expect(result).toContain('<span class="hljs-string">&quot;Hi&quot;</span>');
  // These lines are statements, not concise tags named `export`/`static`.
  expect(result).not.toContain('<span class="hljs-name">export</span>');
  expect(result).not.toContain('<span class="hljs-name">static</span>');
  expect(result).toContain('<span class="hljs-name">div</span>');
});

test("marko highlights HTML-mode control-flow tags with attribute-value conditions", () => {
  registerAll(registry, marko);

  const result = registry.highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
    '<if=count>\n  <span>Some</span>\n</if>\n<else-if=other>\n  <span>x</span>\n</else>\n<for|item, i| of=items by="id">\n  <span>${item}</span>\n</for>',
    { language: "marko" },
  ).value;

  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-keyword">if</span>=count&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;/<span class="hljs-keyword">if</span>&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">else-if</span>');
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-keyword">for</span><span class="hljs-params">|item, i|</span> <span class="hljs-attr">of</span>=items <span class="hljs-attr">by</span>=<span class="hljs-string">&quot;id&quot;</span>&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-name">span</span>');
});

test("marko highlights tag variables, attribute tags, and shorthand heads", () => {
  registerAll(registry, marko);

  const result = registry.highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
    '<let/count=0/>\n<define/Card|{ title }|><h2>${title}</h2></define>\n<await|user|=fetchUser(id)>\n  <@then|user|>${user.name}</@then>\n  <@catch|err|>oops</@catch>\n</await>\n<div.card#main data-x="1">hi</div>\n<my-tag>\n  <@header>Title</@header>\n</my-tag>',
    { language: "marko" },
  ).value;

  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">let</span><span class="hljs-variable">/count</span>=0/&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-name">define</span><span class="hljs-variable">/Card</span><span class="hljs-params">|{ title }|</span>&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-name">await</span><span class="hljs-params">|user|</span>=fetchUser(id)&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">@then</span><span class="hljs-params">|user|</span>&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;/<span class="hljs-name">@then</span>&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">@header</span>&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">div.card#main</span> <span class="hljs-attr">data-x</span>=<span class="hljs-string">&quot;1&quot;</span>&gt;</span>',
  );
  // Ordinary tags still belong to the html sublanguage.
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">my-tag</span>&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-tag">&lt;<span class="hljs-name">h2</span>&gt;</span>',
  );
});

test("marko closes a one-line style block at its own </style>", () => {
  registerAll(registry, marko);

  const result = registry.highlight(
    '<style>.card { color: red; }</style>\n<div class="x">Hi</div>',
    { language: "marko" },
  ).value;

  expect(result).toContain('<span class="hljs-selector-class">.card</span>');
  expect(result).toContain('<span class="hljs-name">div</span>');
  expect(result).toContain('<span class="hljs-string">&quot;x&quot;</span>');
});
