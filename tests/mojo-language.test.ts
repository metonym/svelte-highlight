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
