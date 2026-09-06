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
