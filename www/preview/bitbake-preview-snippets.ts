export type BitbakePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bitbakePreviewSnippets: BitbakePreviewSnippet[] = [
  {
    title: "A simple recipe",
    description: "variable assignments, expansion, and a shell task",
    code: `# recipe for a simple tool
SUMMARY = "A simple tool"
LICENSE = "MIT"
SRC_URI = "git://example.com/tool.git;branch=main"

DEPENDS += "zlib"
S = "\${WORKDIR}/git"

do_install() {
    install -d \${D}\${bindir}
    install -m 0755 tool \${D}\${bindir}
}

python do_after_install() {
    d.setVar('SOMEVAR', 'value')
}
`,
  },
  {
    title: "Append and override syntax",
    description: "the :append, :prepend, and :remove operators",
    code: `FILES:\${PN} += "\${bindir}/tool"
CFLAGS:append = " -DDEBUG"
RDEPENDS:remove = "unwanted-package"`,
  },
  {
    title: "Inline Python",
    description: "an inline Python expansion for computing a value",
    code: `PACKAGE_ARCH = "\${@d.getVar('TARGET_ARCH')}"`,
  },
];
