import hljs from "highlight.js/lib/core";
import gleam from "../src/languages/gleam";

hljs.registerLanguage(gleam.name, gleam.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "gleam" }).value;

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
