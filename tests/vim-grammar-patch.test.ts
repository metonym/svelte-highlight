import hljsFactory from "highlight.js/lib/core";
import stockVim from "highlight.js/lib/languages/vim";
import patchedVim from "../scripts/hljs-patches/vim.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import vim from "../src/languages/vim.js";

// scripts/hljs-patches/vim.js: the `vimscript` and `viml` aliases.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("vim", patchedVim.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("vim", stockVim);

const registry = createRegistry();
registry.register(vim.register);

const CODE = `" Strip trailing whitespace on save.
function! StripTrailing() abort
  let l:pos = getpos('.')
  %s/\\s\\+$//e
  call setpos('.', l:pos)
endfunction
autocmd BufWritePre * call StripTrailing()`;

describe("vim grammar patch", () => {
  it("resolves vimscript to vim", () => {
    expect(resolveLanguageName("vimscript")).toBe("vim");
    expect(resolveLanguageName("VIMSCRIPT")).toBe("vim");
  });

  it("resolves viml to vim", () => {
    expect(resolveLanguageName("viml")).toBe("vim");
    expect(resolveLanguageName("VIML")).toBe("vim");
  });

  it("highlights the same through each alias", () => {
    const expected = stock.highlight(CODE, { language: "vim" }).value;
    expect(registry.highlight(CODE, { language: "vimscript" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "viml" }).value).toEqual(
      expected,
    );
  });

  it("does not change Vim Script output", () => {
    const expected = stock.highlight(CODE, { language: "vim" }).value;
    expect(hljs.highlight(CODE, { language: "vim" }).value).toEqual(expected);
    expect(registry.highlight(CODE, { language: "vim" }).value).toEqual(
      expected,
    );
  });
});
