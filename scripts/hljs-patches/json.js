import base from "highlight.js/lib/languages/json";

/**
 * Patches for highlight.js's JSON grammar.
 *
 * - `jsonl` and `ndjson` aliases. JSON Lines files hold one JSON value
 *   per line, so the JSON grammar fits them.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "jsonl", "ndjson"];

  return lang;
}

export const json = { name: "json", register };
export default json;
