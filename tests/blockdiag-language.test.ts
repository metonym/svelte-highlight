import { createRegistry } from "../src/engine.js";

import blockdiag from "../src/languages/blockdiag";

const registry = createRegistry();

registry.register(blockdiag.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "blockdiag" }).value;

test("blockdiag highlights a diagram opener, edge, and label", () => {
  const result = highlight('blockdiag {\n  A -> B [label = "foo"];\n}');

  expect(result).toContain('<span class="hljs-keyword">blockdiag</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-attr">label</span>');
  expect(result).toContain('<span class="hljs-string">&quot;foo&quot;</span>');
});

test("blockdiag highlights nested groups", () => {
  const result = highlight("group {\n  web; db;\n}");

  expect(result).toContain('<span class="hljs-keyword">group</span>');
});

test("blockdiag highlights nwdiag networks and addresses", () => {
  const result = highlight(
    'nwdiag {\n  network dmz {\n    address = "10.0.0.0/24"\n  }\n}',
  );

  expect(result).toContain('<span class="hljs-keyword">nwdiag</span>');
  expect(result).toContain('<span class="hljs-keyword">network</span>');
  expect(result).toContain('<span class="hljs-attr">address</span>');
});

test("blockdiag highlights comments", () => {
  const result = highlight("// racks\nrackdiag {\n  rack { 1: Server; }\n}");

  expect(result).toContain('<span class="hljs-comment">// racks</span>');
  expect(result).toContain('<span class="hljs-keyword">rackdiag</span>');
  expect(result).toContain('<span class="hljs-keyword">rack</span>');
});

test("blockdiag does not style Graphviz digraph attributes", () => {
  const result = highlight("digraph {\n  rankdir=LR\n}");

  expect(result).not.toContain("hljs-keyword");
  expect(result).not.toContain("hljs-attr");
});
