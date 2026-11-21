import base from "highlight.js/lib/languages/lisp";

/**
 * Patches for highlight.js's Lisp grammar.
 *
 * - `emacs-lisp` and `elisp` aliases. Emacs Lisp files use these names,
 *   and Shiki uses `emacs-lisp`.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "emacs-lisp", "elisp"];

  return lang;
}

export const lisp = { name: "lisp", register };
export default lisp;
