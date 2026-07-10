import { createRegistry } from "../src/engine.js";

import jq from "../src/languages/jq";

const registry = createRegistry();

registry.register(jq.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "jq" }).value;

test("jq highlights field access and the pipe operator", () => {
  const result = highlight(".users | map(select(.active)) | length");

  expect(result).toContain('<span class="hljs-property">.users</span>');
  expect(result).toContain('<span class="hljs-operator">|</span>');
});

test("jq highlights bracketed and optional field access", () => {
  const result = highlight('.["key"]');

  expect(result).toContain('<span class="hljs-string">&quot;key&quot;</span>');
});

test("jq highlights if/then/elif/else/end keywords", () => {
  const result = highlight(
    'if .x then "yes" elif .y then "maybe" else "no" end',
  );

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">then</span>');
  expect(result).toContain('<span class="hljs-keyword">elif</span>');
  expect(result).toContain('<span class="hljs-keyword">else</span>');
  expect(result).toContain('<span class="hljs-keyword">end</span>');
});

test("jq highlights reduce and variable bindings", () => {
  const result = highlight("reduce .[] as $item (0; . + $item)");

  expect(result).toContain('<span class="hljs-keyword">reduce</span>');
  expect(result).toContain('<span class="hljs-keyword">as</span>');
  expect(result).toContain('<span class="hljs-variable">$item</span>');
});

test("jq highlights built-in functions", () => {
  const result = highlight("to_entries | from_entries");

  expect(result).toContain('<span class="hljs-built_in">to_entries</span>');
  expect(result).toContain('<span class="hljs-built_in">from_entries</span>');
});

test("jq highlights string interpolation", () => {
  const result = highlight('"Hello, \\(.name)!"');

  expect(result).toContain(
    '<span class="hljs-string">&quot;Hello, \\(.name)!&quot;</span>',
  );
});

test("jq highlights format strings", () => {
  const result = highlight("[1,2,3] | @csv");

  expect(result).toContain('<span class="hljs-meta">@csv</span>');
});

test("jq highlights comments", () => {
  const result = highlight("# a comment\n.foo");

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});

test("jq highlights function definitions", () => {
  const result = highlight("def add: . + 1;");

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain('<span class="hljs-title function_">add</span>');
});
