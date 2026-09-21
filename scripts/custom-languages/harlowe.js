// Longest first so a shorter alternative (e.g. "link") can't win before a
// longer one that shares its prefix (e.g. "link-goto") gets a chance to match.
const HARLOWE_MACROS =
  "link-goto|link-reveal|link-repeat|link|elseif|else|unless|if|set|put|print|display|goto|go-to|either|random|datanames|cond";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHarlowe(hljs) {
  const VARIABLE = {
    className: "variable",
    begin: /[$_][A-Za-z]\w*/,
    relevance: 0,
  };

  // `(macroname: args)` is Harlowe's one truly distinctive shape -- gating on
  // a known macro name (rather than any `(word:`) keeps this from firing on
  // unrelated parenthesized text. Self-recursive so nested macro calls, like
  // `(if: (either: 1, 2) > 3)`, balance correctly.
  const MACRO_CALL = {
    begin: [/\(/, new RegExp(HARLOWE_MACROS), /:/],
    beginScope: { 2: "keyword" },
    end: /\)/,
    relevance: 5,
    // Scoped to inside a macro call only, so narrative prose outside macros
    // never has "is"/"to"/"and" highlighted as if they were code.
    keywords: {
      keyword: "to into is and or not",
      literal: "true false",
    },
    contains: [
      /** @type {"self"} */ ("self"),
      VARIABLE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
    ],
  };

  // Double brackets only -- a single `[hook]` is too generic a bracket shape
  // to anchor on (same reasoning already applied to Nomnoml's `[A]->[B]`).
  const LINK = {
    className: "string",
    begin: /\[\[/,
    end: /\]\]/,
    relevance: 0,
  };

  return {
    name: "harlowe",
    contains: [hljs.COMMENT("<!--", "-->"), MACRO_CALL, LINK, VARIABLE],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineHarlowe(hljs);
}

export const harlowe = { name: "harlowe", register };
export default harlowe;
