import { createRegistry } from "../src/engine.js";

import gleam from "../src/languages/gleam";

const registry = createRegistry();

registry.register(gleam.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "gleam" }).value;

test("gleam highlights keywords", () => {
  const result = highlight("pub fn main() {\n  let x = 0\n}");

  expect(result).toContain('<span class="hljs-keyword">pub</span>');
  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-keyword">let</span>');
});

test("gleam highlights function names", () => {
  const result = highlight("fn double(x) { x }");

  expect(result).toContain('<span class="hljs-title function_">double</span>');
});

test("gleam highlights types and literals", () => {
  const result = highlight("pub type Color {\n  Red\n}\nconst ok = True");

  expect(result).toContain('<span class="hljs-type">Color</span>');
  expect(result).toContain('<span class="hljs-literal">True</span>');
});

test("gleam highlights numbers", () => {
  const result = highlight("let a = 0xFF\nlet b = 1_000\nlet c = 3.14");

  expect(result).toContain("hljs-number");
});

test("gleam highlights attributes", () => {
  const result = highlight('@external(erlang, "lib", "fun")\npub fn ext() {}');

  expect(result).toContain('<span class="hljs-meta">@external</span>');
});

test("gleam highlights operators", () => {
  const result = highlight(
    'let greeting = "Hello, " <> name\nresult = value |> function_one |> function_two',
  );

  expect(result).toContain('<span class="hljs-operator">|&gt;</span>');
  expect(result).toContain('<span class="hljs-operator">&lt;&gt;</span>');
});

test("gleam highlights arrow operators in use bindings, case clauses, and return types", () => {
  const result = highlight(
    'pub fn f(x: Int) -> String {\n  use conn <- db.with_conn(pool)\n  case x { 1 -> "a" _ -> "b" }\n}',
  );

  expect(result).toContain(
    '<span class="hljs-operator">-&gt;</span> <span class="hljs-type">String</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">use</span> conn <span class="hljs-operator">&lt;-</span> db',
  );
  expect(result).toContain(
    '<span class="hljs-number">1</span> <span class="hljs-operator">-&gt;</span>',
  );
});

test("gleam keeps comparison operators unstyled", () => {
  const result = highlight("let ok = a < b && c > d");

  expect(result).not.toContain("hljs-operator");
});
