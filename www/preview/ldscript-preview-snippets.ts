export type LdscriptPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const ldscriptPreviewSnippets: LdscriptPreviewSnippet[] = [
  {
    title: "A minimal linker script",
    description: "MEMORY and SECTIONS blocks with region assignment",
    code: `/* a simple linker script */
ENTRY(_start)

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 256K
    RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 64K
}

SECTIONS
{
    .text : {
        *(.text*)
    } > FLASH

    .data : {
        *(.data*)
    } > RAM AT> FLASH
}
`,
  },
  {
    title: "Symbols and expressions",
    description: "PROVIDE, ALIGN, and the location counter",
    code: `PROVIDE(_stack_top = ORIGIN(RAM) + LENGTH(RAM));

SECTIONS
{
    .bss : {
        . = ALIGN(4);
        _bss_start = .;
        *(.bss*)
        _bss_end = .;
    } > RAM
}`,
  },
  {
    title: "Input and search paths",
    description: "INPUT, GROUP, and SEARCH_DIR",
    code: `SEARCH_DIR("/usr/lib")
INPUT(libc.a libm.a)
GROUP(libgcc.a libc.a)`,
  },
];
