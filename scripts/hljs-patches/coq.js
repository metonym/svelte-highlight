import base from "highlight.js/lib/languages/coq";

/**
 * Patches for highlight.js's Coq grammar.
 *
 * - `rocq` alias. Coq took the name Rocq in 2025, and newer docs and
 *   fences use the new name.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "rocq"];

  return lang;
}

export const coq = { name: "coq", register };
export default coq;
