import base from "highlight.js/lib/languages/objectivec";

/**
 * Patches for highlight.js's Objective-C grammar.
 *
 * - `objective-c` alias. Shiki and Linguist use the hyphenated name.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "objective-c"];

  return lang;
}

export const objectivec = { name: "objectivec", register };
export default objectivec;
