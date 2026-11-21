import hljsFactory from "highlight.js/lib/core";
import stockLisp from "highlight.js/lib/languages/lisp";
import patchedLisp from "../scripts/hljs-patches/lisp.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import lisp from "../src/languages/lisp.js";

// scripts/hljs-patches/lisp.js: the `emacs-lisp` and `elisp` aliases.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("lisp", patchedLisp.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("lisp", stockLisp);

const registry = createRegistry();
registry.register(lisp.register);

const CODE = `;; Toggle line numbers in programming modes.
(defun my/enable-line-numbers ()
  "Turn on line numbers."
  (display-line-numbers-mode 1))

(add-hook 'prog-mode-hook #'my/enable-line-numbers)
(setq fill-column 80)`;

describe("lisp grammar patch", () => {
  it("resolves emacs-lisp to lisp", () => {
    expect(resolveLanguageName("emacs-lisp")).toBe("lisp");
    expect(resolveLanguageName("EMACS-LISP")).toBe("lisp");
  });

  it("resolves elisp to lisp", () => {
    expect(resolveLanguageName("elisp")).toBe("lisp");
    expect(resolveLanguageName("ELISP")).toBe("lisp");
  });

  it("highlights the same through each alias", () => {
    const expected = stock.highlight(CODE, { language: "lisp" }).value;
    expect(registry.highlight(CODE, { language: "emacs-lisp" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "elisp" }).value).toEqual(
      expected,
    );
  });

  it("does not change Lisp output", () => {
    const expected = stock.highlight(CODE, { language: "lisp" }).value;
    expect(hljs.highlight(CODE, { language: "lisp" }).value).toEqual(expected);
    expect(registry.highlight(CODE, { language: "lisp" }).value).toEqual(
      expected,
    );
  });
});
