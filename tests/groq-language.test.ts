import { createRegistry } from "../src/engine.js";

import groq from "../src/languages/groq";

const registry = createRegistry();

registry.register(groq.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "groq" }).value;

test("groq highlights line comments", () => {
  const result = highlight('// recent posts\n*[_type == "post"]');

  expect(result).toContain('<span class="hljs-comment">// recent posts</span>');
});

test("groq highlights document metadata attributes", () => {
  const result = highlight('*[_type == "movie"]');

  expect(result).toContain('<span class="hljs-meta">_type</span>');
});

test("groq highlights strings and numbers", () => {
  const result = highlight('*[_type == "movie" && releaseYear >= 2018]');

  expect(result).toContain(
    '<span class="hljs-string">&quot;movie&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-number">2018</span>');
});

test("groq highlights the dereference operator", () => {
  const result = highlight('{ "director": director->name }');

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("groq highlights parameters", () => {
  const result = highlight("*[_id == $id]");

  expect(result).toContain('<span class="hljs-variable">$id</span>');
});

test("groq highlights function calls", () => {
  const result = highlight('count(*[_type == "post"])');

  expect(result).toContain('<span class="hljs-built_in">count</span>');
});

test("groq highlights namespaced function calls", () => {
  const result = highlight('{ "plain": pt::text(body) }');

  expect(result).toContain('<span class="hljs-built_in">pt::text</span>');
});

test("groq highlights keywords and literals", () => {
  const result = highlight('*[title match "sci*" && featured == true]');

  expect(result).toContain('<span class="hljs-keyword">match</span>');
  expect(result).toContain('<span class="hljs-literal">true</span>');
});

test("groq highlights the pipe operator", () => {
  const result = highlight('*[_type == "post"] | order(name) | [0...10]');

  expect(result).toContain('<span class="hljs-operator">|</span>');
});

test("groq highlights logical operators", () => {
  const result = highlight("featured == true && !archived || draft");

  expect(result).toContain('<span class="hljs-operator">&amp;&amp;</span>');
  expect(result).toContain('<span class="hljs-operator">||</span>');
  expect(result).toContain('<span class="hljs-operator">!</span>archived');
});

test("groq highlights object-projection aliases as attr", () => {
  const result = highlight('{ title, "slug": slug.current }');

  expect(result).toContain('<span class="hljs-attr">&quot;slug&quot;</span>:');
});
