export type KconfigPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const kconfigPreviewSnippets: KconfigPreviewSnippet[] = [
  {
    title: "Kernel debug options",
    description: "config definitions, attributes, and a help body",
    code: `config DEBUG_KERNEL
    bool "Kernel debugging"
    default n
    help
      Say Y here to enable kernel debugging.
      This adds extra checks and may slow the
      kernel down.

config LOG_LEVEL
    int "Log level"
    range 0 7
    default 4
    depends on DEBUG_KERNEL
`,
  },
  {
    title: "Menus and choices",
    description: "menu/endmenu and choice/endchoice blocks",
    code: `menu "Networking"

choice
    prompt "Driver"
    default DRIVER_A

config DRIVER_A
    bool "Driver A"

config DRIVER_B
    bool "Driver B"
endchoice

endmenu`,
  },
  {
    title: "Source and conditionals",
    description: "source and if/endif blocks",
    code: `if NETWORKING
    source "drivers/net/Kconfig"
endif`,
  },
];
