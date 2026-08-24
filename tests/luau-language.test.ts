import { createRegistry } from "../src/engine.js";

import luau from "../src/languages/luau";

const registry = createRegistry();

registry.register(luau.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "luau" }).value;

test("luau highlights export type and continue", () => {
  const result = highlight(
    `export type Point = { x: number, y: number }
local function step()
  continue
end
`,
  );

  expect(result).toContain('<span class="hljs-keyword">export type</span>');
  expect(result).toContain('<span class="hljs-keyword">continue</span>');
  expect(result).toContain('<span class="hljs-type">number</span>');
});

test("luau highlights function names and type assertions", () => {
  const result = highlight(
    `local function add(a: number, b: number): number
  return (a + b) :: number
end
`,
  );

  expect(result).toContain('<span class="hljs-keyword">function</span>');
  expect(result).toContain('<span class="hljs-title function_">add</span>');
  expect(result).toContain('<span class="hljs-operator">::</span>');
});

test("luau highlights comments and strings", () => {
  const result = highlight('-- greet\nlocal msg = "hello"');

  expect(result).toContain('<span class="hljs-comment">-- greet</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;hello&quot;</span>',
  );
});

test("luau highlights long bracket strings and comments", () => {
  const result = highlight("--[[ block ]]\nlocal s = [=[hello]=]");

  expect(result).toContain('<span class="hljs-comment">--[[ block ]]</span>');
  expect(result).toContain('<span class="hljs-string">[=[hello]=]</span>');
});

test("luau highlights literals", () => {
  const result = highlight("local x = true\nlocal y = nil");

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">nil</span>');
});
