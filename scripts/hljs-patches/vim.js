import base from "highlight.js/lib/languages/vim";

/**
 * Patches for highlight.js's Vim Script grammar.
 *
 * - `vimscript` and `viml` aliases. Linguist and Shiki name Vim Script
 *   this way.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "vimscript", "viml"];

  return lang;
}

export const vim = { name: "vim", register };
export default vim;
