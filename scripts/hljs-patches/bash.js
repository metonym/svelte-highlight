import base from "highlight.js/lib/languages/bash";

/**
 * Patches for highlight.js's Bash grammar.
 *
 * - `shellscript` alias. Shiki names its Bash grammar `shellscript`.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "shellscript"];

  return lang;
}

export const bash = { name: "bash", register };
export default bash;
