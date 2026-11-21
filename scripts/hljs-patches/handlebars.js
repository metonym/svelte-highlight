import base from "highlight.js/lib/languages/handlebars";

/**
 * Patches for highlight.js's Handlebars grammar.
 *
 * - `mustache` alias. Mustache templates use the same `{{…}}` tags as
 *   Handlebars.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "mustache"];

  return lang;
}

export const handlebars = { name: "handlebars", register };
export default handlebars;
