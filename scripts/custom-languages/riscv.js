// RISC-V assembly in GNU `as` syntax: RV32/RV64 base, the M, A, F, D, Q,
// Zfh, C, Zicsr, Zba/Zbb, and V extensions, the standard pseudo-
// instructions, ABI and numeric register names, common CSRs, assembler
// directives, `%hi()`-style relocations, labels, and `#` / `//` / `/* */`
// comments.
//
// Many mnemonics also appear in MIPS, ARM, and x86 assembly. Those score
// zero or one, so auto-detect leans on what only RISC-V has: `xN` and
// `fa0`-style registers, `auipc`, `ecall`, `csrr*`, `amo*`, `%pcrel_hi`,
// and the like. MIPS writes registers as `$t0`; a zero-score `$name` mode
// keeps those from counting as RISC-V ABI names.

/** @param {string} list */
const words = (list) => list.trim().split(/\s+/);

/**
 * @param {string[]} list
 * @param {number} relevance
 */
const scored = (list, relevance) =>
  list.map((word) => (relevance === 1 ? word : `${word}|${relevance}`));

/**
 * @param {string[]} stems
 * @param {string[]} suffixes
 */
const expand = (stems, suffixes) =>
  stems.flatMap((stem) => suffixes.map((suffix) => `${stem}.${suffix}`));

const FLOAT_TYPES = ["s", "d", "q", "h"];
const INT_TYPES = ["w", "wu", "l", "lu"];

// Mnemonics that MIPS, ARM, or x86 also use. They score zero.
const SHARED = words(`
  add addi sub and andi or ori xor xori not neg sll srl sra slt sltu slti
  sltiu lb lh lw sb sh sw lui beq bne blt bge bgt ble j jal jr jalr nop mul
  div divu rem fence pause min max
`);

// Common pseudo-instructions and RV64 loads that other assemblers use
// less often. They score one.
const COMMON = words(`
  li la mv ret call beqz bnez blez bgez bltz bgtz bltu bgeu lbu lhu ld sd
`);

// Mnemonics that mark a file as RISC-V.
const DISTINCT = [
  ...words(`
    auipc lwu addiw slliw srliw sraiw addw subw sllw srlw sraw slli srli
    srai fence.i fence.tso ecall ebreak mret sret uret wfi sfence.vma
    hfence.vvma hfence.gvma
    mulh mulhsu mulhu remu mulw divw divuw remw remuw
    lla lga negw sext.w sext.b sext.h zext.b zext.h zext.w seqz snez sltz
    sgtz bgtu bleu tail
    csrr csrw csrs csrc csrwi csrsi csrci csrrw csrrs csrrc csrrwi csrrsi
    csrrci rdcycle rdtime rdinstret rdcycleh rdtimeh rdinstreth
    frcsr fscsr frrm fsrm frflags fsflags
    fmv.x.w fmv.w.x fmv.x.d fmv.d.x fmv.x.h fmv.h.x
    sh1add sh2add sh3add sh1add.uw sh2add.uw sh3add.uw add.uw slli.uw andn
    orn xnor clz clzw ctz ctzw cpop cpopw maxu minu rol rolw ror rorw rori
    roriw rev8 orc.b
    vsetvli vsetivli vsetvl
  `),
  // `lr.w`, `amoswap.d.aqrl`, ...
  ...expand(
    words(`
      lr sc amoswap amoadd amoxor amoand amoor amomin amomax amominu amomaxu
    `),
    ["w", "d", "w.aq", "w.rl", "w.aqrl", "d.aq", "d.rl", "d.aqrl"],
  ),
  // `flw`, `fadd.d`, `fcvt.w.s`, `fcvt.d.s`, ...
  ...words("flw fsw fld fsd flq fsq flh fsh"),
  ...expand(
    words(`
      fmadd fmsub fnmsub fnmadd fadd fsub fmul fdiv fsqrt fsgnj fsgnjn
      fsgnjx fmin fmax feq flt fle fclass fmv fabs fneg
    `),
    FLOAT_TYPES,
  ),
  ...expand(
    INT_TYPES.map((type) => `fcvt.${type}`),
    FLOAT_TYPES,
  ),
  ...expand(
    FLOAT_TYPES.map((type) => `fcvt.${type}`),
    [...INT_TYPES, ...FLOAT_TYPES],
  ),
  // Compressed instructions.
  ...words(`
    c.addi c.addiw c.addi16sp c.addi4spn c.li c.lui c.mv c.add c.addw c.sub
    c.subw c.and c.andi c.or c.xor c.slli c.srli c.srai c.j c.jal c.jr
    c.jalr c.beqz c.bnez c.lw c.sw c.ld c.sd c.lwsp c.swsp c.ldsp c.sdsp
    c.flw c.fsw c.fld c.fsd c.fldsp c.fsdsp c.nop c.ebreak
  `),
];

const NUMBERED = (/** @type {string} */ prefix) =>
  Array.from({ length: 32 }, (_, i) => `${prefix}${i}`);

// Integer ABI names. MIPS has most of them too, but writes them `$t0`,
// so the bare form is a good RISC-V signal.
const ABI_REGISTERS = words(`
  zero ra sp gp tp t0 t1 t2 t3 t4 t5 t6 s0 s1 s2 s3 s4 s5 s6 s7 s8 s9
  s10 s11 a0 a1 a2 a3 a4 a5 a6 a7
`);

// Floating-point ABI names and the vector mask operand.
const FLOAT_ABI_REGISTERS = words(`
  ft0 ft1 ft2 ft3 ft4 ft5 ft6 ft7 ft8 ft9 ft10 ft11 fs0 fs1 fs2 fs3 fs4 fs5
  fs6 fs7 fs8 fs9 fs10 fs11 fa0 fa1 fa2 fa3 fa4 fa5 fa6 fa7 v0.t
`);

const CSRS = words(`
  mstatus misa medeleg mideleg mie mtvec mcounteren mscratch mepc mcause
  mtval mip mhartid mvendorid marchid mimpid mcycle minstret
  sstatus sie stvec scounteren sscratch sepc scause stval sip satp
  cycle time instret cycleh timeh instreth fflags frm fcsr
  vstart vxsat vxrm vcsr vl vtype vlenb
`);

const DIRECTIVES = words(`
  .text .data .rodata .bss .section .previous .pushsection .popsection
  .globl .global .local .weak .hidden .protected .type .size .ident .file
  .align .p2align .balign .skip .space .zero .fill .org
  .byte .half .short .2byte .word .long .4byte .dword .quad .8byte
  .float .double .ascii .asciz .string .incbin .uleb128 .sleb128
  .equ .set .equiv .option .attribute .insn .macro .endm .rept .irp .irpc
  .endr .if .ifdef .ifndef .else .elseif .endif .include .comm .lcomm
  .cfi_startproc .cfi_endproc .cfi_def_cfa .cfi_def_cfa_offset .cfi_offset
  .cfi_restore .cfi_sections
`);

// `vsetvli t0, a0, e32, m4, ta, ma` and `fcvt.w.s a0, fa0, rtz`
const OPERAND_LITERALS = words(`
  e8 e16 e32 e64 m1 m2 m4 m8 mf2 mf4 mf8 ta tu ma mu
  rne rtz rdn rup rmm dyn
`);

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRiscv(hljs) {
  return {
    name: "RISC-V Assembly",
    aliases: ["riscvasm", "rv"],
    case_insensitive: true,
    keywords: {
      $pattern: /\.?[a-z_][\w.]*/,
      keyword: [
        ...scored(SHARED, 0),
        ...scored(COMMON, 1),
        ...scored(DISTINCT, 2),
      ],
      built_in: [
        "fp|0",
        ...scored(ABI_REGISTERS, 2),
        ...scored(FLOAT_ABI_REGISTERS, 2),
        ...scored(NUMBERED("x"), 2),
        ...scored(NUMBERED("f"), 0),
        ...scored(NUMBERED("v"), 0),
        ...scored(CSRS, 0),
      ],
      literal: scored(OPERAND_LITERALS, 0),
      meta: scored(DIRECTIVES, 0),
    },
    contains: [
      // `#include <asm.h>` and friends in `.S` files run through cpp.
      {
        className: "meta",
        begin:
          /^[ \t]*#[ \t]*(?:include|define|undef|if|ifdef|ifndef|elif|else|endif|error|pragma)\b/,
        end: /$/,
        contains: [{ className: "string", begin: /<[^>\n]+>|"[^"\n]*"/ }],
      },
      hljs.COMMENT(/#/, /$/, { relevance: 0 }),
      // `$t0` is MIPS register syntax, not a RISC-V ABI name.
      { begin: /\$\w+/, relevance: 0 },
      hljs.COMMENT(/\/\//, /$/, { relevance: 0 }),
      hljs.C_BLOCK_COMMENT_MODE,
      // Vector instructions: `vadd.vv`, `vle32.v`, `vfmacc.vf`, ...
      {
        className: "keyword",
        begin: /\bv[a-z][a-z0-9]*(?:\.[a-z0-9]+)+\b/,
        relevance: 1,
      },
      // `%hi(msg)`, `%pcrel_lo(1b)`, `%tprel_add(x)`
      {
        className: "title.function",
        begin: /%[a-z_]+(?=\()/,
        relevance: 3,
      },
      {
        className: "symbol",
        variants: [
          { begin: /^[ \t]*[a-z_.$][\w.$]*:/ },
          { begin: /^[ \t]*\d+:/ },
          // `1b`, `2f`: the nearest numeric label back or forward.
          { begin: /\b\d+[bf]\b/ },
        ],
        relevance: 0,
      },
      hljs.QUOTE_STRING_MODE,
      {
        className: "string",
        begin: /'(?:\\.|[^'\\])'/,
        relevance: 0,
      },
      {
        className: "number",
        variants: [
          { begin: /\b0x[0-9a-f]+\b/ },
          { begin: /\b0b[01]+\b/ },
          { begin: /-?\b\d+\b/ },
        ],
        relevance: 0,
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRiscv(hljs);
}

export const riscv = { name: "riscv", register };
export default riscv;
