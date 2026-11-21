import { createRegistry } from "../src/engine.js";

import mlir from "../src/languages/mlir";

const registry = createRegistry();

registry.register(mlir.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "mlir" }).value;

test("mlir highlights pretty-form operations", () => {
  const result = highlight("%sum = arith.addi %a, %b : i32");

  expect(result).toContain('<span class="hljs-variable">%sum</span>');
  expect(result).toContain('<span class="hljs-keyword">arith.addi</span>');
  expect(result).toContain('<span class="hljs-variable">%a</span>');
  expect(result).toContain('<span class="hljs-type">i32</span>');
});

test("mlir keeps generic-form op names as strings", () => {
  const result = highlight(
    '%0 = "arith.constant"() {value = 1 : i64} : () -> i64',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;arith.constant&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-type">i64</span>');
});

test("mlir highlights functions, symbols, and arguments", () => {
  const result = highlight(
    "func.func @add(%arg0: i32, %arg1: i32) -> i32 {\n  return %arg0 : i32\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">func.func</span>');
  expect(result).toContain('<span class="hljs-title">@add</span>');
  expect(result).toContain('<span class="hljs-variable">%arg0</span>');
  expect(result).toContain('<span class="hljs-keyword">return</span>');
});

test("mlir highlights block labels", () => {
  const result = highlight("cf.br ^bb1(%x : i32)\n^bb1(%y: i32):");

  expect(result).toContain('<span class="hljs-keyword">cf.br</span>');
  expect(result).toContain('<span class="hljs-symbol">^bb1</span>');
});

test("mlir highlights shaped types and their element types", () => {
  const result = highlight("%t : tensor<4x?xf32>, memref<16x16xbf16, 1>");

  expect(result).toContain('<span class="hljs-type">tensor</span>');
  expect(result).toContain('<span class="hljs-type">f32</span>');
  expect(result).toContain('<span class="hljs-number">?</span>');
  expect(result).toContain('<span class="hljs-type">memref</span>');
  expect(result).toContain('<span class="hljs-type">bf16</span>');
});

test("mlir highlights attribute and type aliases", () => {
  const result = highlight(
    "#map = affine_map<(d0) -> (d0 * 2)>\n!ptr = !llvm.ptr",
  );

  expect(result).toContain('<span class="hljs-attr">#map</span>');
  expect(result).toContain('<span class="hljs-built_in">affine_map</span>');
  expect(result).toContain('<span class="hljs-type">!ptr</span>');
  expect(result).toContain('<span class="hljs-type">!llvm.ptr</span>');
});

test("mlir leaves dotted attribute names plain", () => {
  const result = highlight("module attributes {gpu.container_module} {\n}");

  expect(result).toContain('<span class="hljs-keyword">module</span>');
  expect(result).not.toContain(
    '<span class="hljs-keyword">gpu.container_module</span>',
  );
});

test("mlir highlights locations and comments", () => {
  const result = highlight('return loc("a.mlir":3:7) // done');

  expect(result).toContain('<span class="hljs-built_in">loc</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;a.mlir&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-comment">// done</span>');
});
