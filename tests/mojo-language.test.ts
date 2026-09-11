import { createRegistry } from "../src/engine.js";

import mojo from "../src/languages/mojo";

const registry = createRegistry();

registry.register(mojo.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "mojo" }).value;

const SEED = `fn add(x: Int, y: Int) -> Int:
    return x + y

struct Point:
    var x: Float64
    fn __init__(inout self, x: Float64):
        self.x = x
`;

test("mojo highlights fn, struct, var, and inout", () => {
  const result = highlight(SEED);

  expect(result).toContain('<span class="hljs-keyword">fn</span>');
  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-keyword">var</span>');
  expect(result).toContain('<span class="hljs-keyword">inout</span>');
  expect(result).toContain('<span class="hljs-type">Int</span>');
  expect(result).toContain('<span class="hljs-type">Float64</span>');
  expect(result).toContain('<span class="hljs-title class_">Point</span>');
});

test("mojo highlights comments and strings", () => {
  const result = highlight('# origin\nvar name = "Ada"\n');

  expect(result).toContain('<span class="hljs-comment"># origin</span>');
  expect(result).toContain('<span class="hljs-string">&quot;Ada&quot;</span>');
});

test("mojo highlights nested struct methods and owned params", () => {
  const result = highlight(
    `struct Point:
    var x: Float64
    fn __init__(inout self, x: Float64):
        self.x = x
    fn take(owned self):
        pass
`,
  );

  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-keyword">owned</span>');
  expect(result).toContain('<span class="hljs-keyword">inout</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">__init__</span>',
  );
});

test("mojo highlights def names and raises/out/deinit/imm", () => {
  const result = highlight(
    "def add(x: Int, mut acc: Int) raises -> Int:\n    return acc\ndef __init__(out self, x: Int):\n    pass\ndef __deinit__(deinit self):\n    pass\ndef greet(imm name: String):\n    ref n = name\n",
  );

  expect(result).toContain('<span class="hljs-keyword">def</span>');
  expect(result).toContain('<span class="hljs-title function_">add</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">__init__</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">raises</span>');
  expect(result).toContain('<span class="hljs-keyword">out</span>');
  expect(result).toContain('<span class="hljs-keyword">deinit</span>');
  expect(result).toContain('<span class="hljs-keyword">imm</span>');
  expect(result).toContain('<span class="hljs-keyword">ref</span>');
});

test("mojo still highlights fn names and does not treat outer as out", () => {
  const result = highlight("fn legacy(inout self):\n    var outer = 1\n");

  expect(result).toContain('<span class="hljs-title function_">legacy</span>');
  expect(result).toContain('<span class="hljs-keyword">inout</span>');
  expect(result).toContain("outer =");
  expect(result).not.toContain('<span class="hljs-keyword">out</span>er');
});
