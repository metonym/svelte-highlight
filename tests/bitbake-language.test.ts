import { createRegistry, registerAll } from "../src/engine.js";

import bitbake from "../src/languages/bitbake";

const registry = createRegistry();

registerAll(registry, bitbake);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bitbake" }).value;

test("bitbake highlights variable assignment operators", () => {
  const result = highlight('MYVAR += "zlib"');

  expect(result).toContain('<span class="hljs-variable">MYVAR</span>');
  expect(result).toContain('<span class="hljs-operator">+=</span>');
});

test("bitbake highlights variable expansion", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: BitBake's own ${} expansion syntax, not a JS template literal
  const result = highlight('S = "${WORKDIR}/git"');

  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: BitBake's own ${} expansion syntax, not a JS template literal
    '<span class="hljs-template-variable">${WORKDIR}</span>',
  );
});

test("bitbake highlights shell function bodies", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: BitBake's own ${} expansion syntax, not a JS template literal
  const result = highlight("do_install() {\n    install -d ${D}\n}");

  expect(result).toContain(
    '<span class="hljs-title function_">do_install</span>',
  );
  expect(result).toContain('<span class="language-bash">');
});

test("bitbake highlights well-known built-in variables", () => {
  const result = highlight('LICENSE = "MIT"');

  expect(result).toContain('<span class="hljs-built_in">LICENSE</span>');
});

test("bitbake highlights comments", () => {
  const result = highlight('# a comment\nSUMMARY = "A tool"');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
});

test("bitbake highlights inherit_defer and include_all", () => {
  const result = highlight(
    "inherit_defer python3targetconfig\ninclude_all recipes-extra/*.inc",
  );

  expect(result).toContain('<span class="hljs-keyword">inherit_defer</span>');
  expect(result).toContain('<span class="hljs-keyword">include_all</span>');
});

test("bitbake highlights python task bodies as python, not bash", () => {
  const result = highlight(
    "python do_configure() {\n    d.setVar('X', '1')\n}",
  );

  expect(result).toContain('<span class="hljs-keyword">python</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">do_configure</span>',
  );
  expect(result).toContain('<span class="language-python">');
  expect(result).not.toContain('<span class="language-bash">');
});

test("bitbake shell functions are unchanged", () => {
  const result = highlight("do_install() {\n    install -d dest\n}");

  expect(result).toContain(
    '<span class="hljs-title function_">do_install</span>',
  );
  expect(result).toContain('<span class="language-bash">');
});

test("bitbake highlights expanded overrides on assignment", () => {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: BitBake override expansion
  const result = highlight('RDEPENDS:${PN} += "bash"');

  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: BitBake override expansion
    '<span class="hljs-built_in">RDEPENDS:${PN}</span>',
  );
});
