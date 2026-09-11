import { createRegistry, registerAll } from "../src/engine.js";

import baml from "../src/languages/baml";

const registry = createRegistry();

registerAll(registry, baml);

const highlight = (code: string) =>
  registry.highlight(code, { language: "baml" }).value;

test("baml highlights the function arrow", () => {
  const result = highlight("function Extract(text: string) -> Resume {");

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-keyword">function</span>');
});

test("baml highlights attributes", () => {
  const result = highlight('@description("a field")');

  expect(result).toContain('<span class="hljs-meta">@description</span>');
});

test("baml highlights a prompt raw string as the relevance carrier", () => {
  const result = highlight('prompt #"hello"#');

  expect(result).toContain('<span class="hljs-string">');
});

test("baml highlights keywords and literals", () => {
  const result = highlight("class Resume {\n  valid: bool = true\n}");

  expect(result).toContain('<span class="hljs-keyword">class</span>');
  expect(result).toContain('<span class="hljs-keyword">bool</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
});

test("baml highlights comments", () => {
  const result = highlight("// a comment\nclass Resume {}");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
});

test("baml highlights dotted streaming attributes as one token", () => {
  const result = highlight(
    'class Msg {\n  text string @stream.done @stream.not_null\n  state int @stream.with_state\n  name string @alias("n")\n}',
  );

  expect(result).toContain('<span class="hljs-meta">@stream.done</span>');
  expect(result).toContain('<span class="hljs-meta">@stream.not_null</span>');
  expect(result).toContain('<span class="hljs-meta">@stream.with_state</span>');
  expect(result).toContain('<span class="hljs-meta">@alias</span>(');
  expect(result).not.toContain('<span class="hljs-meta">@stream</span>.');
});

test("baml highlights env references, prompt, and media types", () => {
  const result = highlight(
    'client<llm> GPT4 {\n  provider openai\n  options {\n    api_key env.OPENAI_API_KEY\n  }\n}\nfunction F(doc: pdf, clip: video) -> string {\n  client GPT4\n  prompt #"hi"#\n}',
  );

  expect(result).toContain(
    'api_key <span class="hljs-variable">env.OPENAI_API_KEY</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">prompt</span> ');
  expect(result).toContain('<span class="hljs-keyword">pdf</span>');
  expect(result).toContain('<span class="hljs-keyword">video</span>');
  // A field that merely contains `env` is not an env reference.
  expect(highlight("environment string")).not.toContain("hljs-variable");
});
