import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";

import riscv from "../src/languages/riscv";

const registry = createRegistry();

registry.register(riscv.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "riscv" }).value;

test("riscv highlights mnemonics, pseudo-instructions, and registers", () => {
  const result = highlight(
    "addi sp, sp, -16\nli a0, 1\nmv x5, zero\nfadd.d fa0, fa1, f2\nret",
  );

  expect(result).toContain('<span class="hljs-keyword">addi</span>');
  expect(result).toContain('<span class="hljs-keyword">li</span>');
  expect(result).toContain('<span class="hljs-keyword">mv</span>');
  expect(result).toContain('<span class="hljs-keyword">fadd.d</span>');
  expect(result).toContain('<span class="hljs-keyword">ret</span>');
  expect(result).toContain('<span class="hljs-built_in">sp</span>');
  expect(result).toContain('<span class="hljs-built_in">x5</span>');
  expect(result).toContain('<span class="hljs-built_in">zero</span>');
  expect(result).toContain('<span class="hljs-built_in">fa0</span>');
  expect(result).toContain('<span class="hljs-built_in">f2</span>');
  expect(result).toContain('<span class="hljs-number">-16</span>');
});

test("riscv highlights atomic, CSR, compressed, and vector instructions", () => {
  const result = highlight(
    "amoswap.w.aqrl t0, t1, (a0)\ncsrrs t2, mstatus, zero\nc.addi sp, -16\nvsetvli t0, a0, e32, m4, ta, ma\nvle32.v v8, (a1)\nvadd.vv v8, v8, v16, v0.t",
  );

  expect(result).toContain('<span class="hljs-keyword">amoswap.w.aqrl</span>');
  expect(result).toContain('<span class="hljs-keyword">csrrs</span>');
  expect(result).toContain('<span class="hljs-built_in">mstatus</span>');
  expect(result).toContain('<span class="hljs-keyword">c.addi</span>');
  expect(result).toContain('<span class="hljs-keyword">vsetvli</span>');
  expect(result).toContain('<span class="hljs-literal">e32</span>');
  expect(result).toContain('<span class="hljs-keyword">vle32.v</span>');
  expect(result).toContain('<span class="hljs-keyword">vadd.vv</span>');
  expect(result).toContain('<span class="hljs-built_in">v0.t</span>');
});

test("riscv highlights directives, labels, and relocations", () => {
  const result = highlight(
    '    .section .rodata\nmsg: .asciz "hi"\n1:  lui a1, %hi(msg)\n    addi a1, a1, %lo(msg)\n    bnez t0, 1b',
  );

  expect(result).toContain('<span class="hljs-meta">.section</span>');
  expect(result).toContain('<span class="hljs-meta">.rodata</span>');
  expect(result).toContain('<span class="hljs-symbol">msg:</span>');
  expect(result).toContain('<span class="hljs-symbol">1:</span>');
  expect(result).toContain('<span class="hljs-symbol">1b</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">%hi</span>(msg)',
  );
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("riscv highlights comments and preprocessor lines", () => {
  const result = highlight(
    "#include <asm.h>\nli a7, 93 # exit\nnop // spin\n/* block */",
  );

  expect(result).toContain(
    '<span class="hljs-meta">#include <span class="hljs-string">&lt;asm.h&gt;</span></span>',
  );
  expect(result).toContain('<span class="hljs-comment"># exit</span>');
  expect(result).toContain('<span class="hljs-comment">// spin</span>');
  expect(result).toContain('<span class="hljs-comment">/* block */</span>');
});

test("riscv resolves its aliases", () => {
  expect(resolveLanguageName("riscvasm")).toBe("riscv");
  expect(resolveLanguageName("rv")).toBe("riscv");
});
