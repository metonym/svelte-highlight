import base from "highlight.js/lib/languages/mathematica";

/**
 * Patches for highlight.js's Mathematica grammar.
 *
 * - `wolfram` alias. Mathematica's language is now named the Wolfram
 *   Language. The grammar already takes `wl`, and Shiki names it
 *   `wolfram`.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "wolfram"];

  return lang;
}

export const mathematica = { name: "mathematica", register };
export default mathematica;
