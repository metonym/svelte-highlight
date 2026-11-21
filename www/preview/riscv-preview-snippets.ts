export type RiscvPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const riscvPreviewSnippets: RiscvPreviewSnippet[] = [
  {
    title: "Hello, world on Linux",
    description: "directives, %hi/%lo relocations, and ecall",
    code: `# riscv64-linux-gnu-as hello.s -o hello.o
    .section .rodata
msg:
    .asciz "Hello, RISC-V!\\n"
    .equ MSG_LEN, . - msg - 1

    .text
    .globl _start
_start:
    li      a0, 1               # fd = stdout
    lui     a1, %hi(msg)
    addi    a1, a1, %lo(msg)
    li      a2, MSG_LEN
    li      a7, 64              # __NR_write
    ecall

    li      a0, 0
    li      a7, 93              # __NR_exit
    ecall`,
  },
  {
    title: "A leaf and a non-leaf function",
    description: "stack frames, pseudo-instructions, and local labels",
    code: `    .text
    .globl strlen
# size_t strlen(const char *s)
strlen:
    mv      t0, a0
1:  lbu     t1, 0(t0)
    beqz    t1, 2f
    addi    t0, t0, 1
    j       1b
2:  sub     a0, t0, a0
    ret

    .globl puts_len
# size_t puts_len(const char *s): print s and return its length
puts_len:
    addi    sp, sp, -16
    sd      ra, 8(sp)
    sd      s0, 0(sp)
    mv      s0, a0
    call    strlen
    mv      a2, a0
    mv      a1, s0
    li      a0, 1
    li      a7, 64
    ecall
    ld      s0, 0(sp)
    ld      ra, 8(sp)
    addi    sp, sp, 16
    ret`,
  },
  {
    title: "Machine-mode trap setup",
    description: "CSRs, atomics, and a spin lock",
    code: `    .section .text.init
    .globl _entry
_entry:
    csrr    t0, mhartid
    bnez    t0, park            // only hart 0 boots
    la      t0, trap_vector
    csrw    mtvec, t0
    li      t0, (1 << 7)        /* MTIE */
    csrs    mie, t0
    csrsi   mstatus, 8          /* MIE */
    tail    kmain

park:
    wfi
    j       park

# void spin_lock(int *lock)
spin_lock:
    li      t0, 1
1:  amoswap.w.aq t1, t0, (a0)
    bnez    t1, 1b
    ret

spin_unlock:
    amoswap.w.rl zero, zero, (a0)
    ret`,
  },
  {
    title: "Vector and floating point",
    description: "a strip-mined SAXPY loop with the V extension",
    code: `# void saxpy(size_t n, float a, const float *x, float *y)
#   y[i] = a * x[i] + y[i]
    .globl saxpy
saxpy:
    vsetvli t0, a0, e32, m8, ta, ma
    vle32.v v0, (a1)
    vle32.v v8, (a2)
    vfmacc.vf v8, fa0, v0
    vse32.v v8, (a2)
    slli    t1, t0, 2
    add     a1, a1, t1
    add     a2, a2, t1
    sub     a0, a0, t0
    bnez    a0, saxpy
    ret

# int scale(int x, float k): convert, scale, and truncate toward zero
scale:
    fcvt.s.w ft0, a0
    fmul.s  ft0, ft0, fa0
    fcvt.w.s a0, ft0, rtz
    ret`,
  },
];
