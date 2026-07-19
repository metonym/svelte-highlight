import { createRegistry, registerAll } from "../src/engine.js";

import heex from "../src/languages/heex";

const registry = createRegistry();

registerAll(registry, heex);

const highlight = (code: string) =>
  registry.highlight(code, { language: "heex" }).value;

test("heex highlights the HEEx-specific comment", () => {
  const result = highlight("<%!-- a comment --%>");

  expect(result).toContain(
    '<span class="hljs-comment">&lt;%!-- a comment --%&gt;</span>',
  );
});

test("heex delegates surrounding markup to html", () => {
  const result = highlight("<div><p>hi</p></div>");

  expect(result).toContain("hljs-tag");
  expect(result).toContain('<span class="hljs-name">div</span>');
});

test("heex highlights <%= %> output tags as elixir", () => {
  const result = highlight("<%= @user.name %>");

  expect(result).toContain("language-elixir");
  expect(result).toContain('<span class="hljs-variable">@user</span>');
});

test("heex highlights a multi-line <%= if %> / <% end %> block spanning markup", () => {
  const result = highlight(
    "<ul>\n  <%= for post <- @posts do %>\n    <li>{post.title}</li>\n  <% end %>\n</ul>",
  );

  expect(result).toContain('<span class="hljs-keyword">for</span>');
  expect(result).toContain('<span class="hljs-keyword">do</span>');
  expect(result).toContain('<span class="hljs-keyword">end</span>');
  expect(result).toContain('<span class="hljs-name">li</span>');
});

test("heex highlights {expr} interpolation in text position", () => {
  const result = highlight("<p>{@count} items</p>");

  expect(result).toContain('<span class="language-elixir">{<span class="hljs-variable">@count</span>}</span>');
});

test("heex highlights {expr} interpolation in an attribute value", () => {
  const result = highlight('<div class={@highlighted && "border-blue-500"}>hi</div>');

  expect(result).toContain('<span class="hljs-attr">class</span>');
  expect(result).toContain('<span class="hljs-variable">@highlighted</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;border-blue-500&quot;</span>',
  );
});

test("heex does not get stuck when an interpolated attribute is followed by another attribute", () => {
  const result = highlight(
    '<.button phx-click="follow" disabled={@following}>Follow</.button>',
  );

  expect(result).toContain(
    '<span class="hljs-attr">phx-click</span>=<span class="hljs-string">&quot;follow&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-attr">disabled</span>');
  expect(result).toContain('<span class="hljs-variable">@following</span>');
});

test("heex highlights function components with a leading-dot tag name", () => {
  const result = highlight('<.card class="a">content</.card>');

  expect(result).toContain('<span class="hljs-tag">&lt;.card');
  expect(result).toContain("&lt;/.card&gt;");
});

test("heex highlights remote/module components", () => {
  const result = highlight(
    "<MyAppWeb.CoreComponents.button>Save</MyAppWeb.CoreComponents.button>",
  );

  expect(result).toContain(
    '<span class="hljs-name">MyAppWeb.CoreComponents.button</span>',
  );
});

test("heex highlights slots with a leading-colon tag name", () => {
  const result = highlight("<:header><h2>Title</h2></:header>");

  expect(result).toContain('<span class="hljs-tag">&lt;:header&gt;</span>');
  expect(result).toContain('<span class="hljs-tag">&lt;/:header&gt;</span>');
});

test("heex highlights :if/:for special attributes", () => {
  const result = highlight('<p :if={@user.bio}>{@user.bio}</p>');

  expect(result).toContain('<span class="hljs-keyword">:if</span>');

  const forResult = highlight(
    '<li :for={item <- @items}>{item}</li>',
  );
  expect(forResult).toContain('<span class="hljs-keyword">:for</span>');
});

test("heex balances a nested map literal inside an interpolation", () => {
  const result = highlight("<div data-foo={%{a: 1, b: 2}}>hi</div>");

  expect(result).toContain('<span class="hljs-symbol">a:</span>');
  expect(result).toContain('<span class="hljs-symbol">b:</span>');
});
