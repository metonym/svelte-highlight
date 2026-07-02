const GLEAM_KEYWORDS =
  "as assert case const fn if import let opaque panic pub todo type use echo";

const GLEAM_LITERALS = "True False Nil";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineGleam(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b0[oO][0-7][0-7_]*\b/ },
      { begin: /\b0[bB][01][01_]*\b/ },
      { begin: /\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const LITERAL = {
    className: "literal",
    begin: /\b(?:True|False|Nil)\b/,
  };

  const TYPE = {
    className: "type",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /@[a-z]\w*/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /\|>|<>/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfn/, /\s+/, /[a-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title function_" },
  };

  return {
    name: "Gleam",
    aliases: ["gleam"],
    keywords: { keyword: GLEAM_KEYWORDS, literal: GLEAM_LITERALS },
    contains: [
      hljs.COMMENT(/\/\/\/?\/?/, /$/),
      hljs.QUOTE_STRING_MODE,
      ATTRIBUTE,
      OPERATOR,
      NUMBER,
      FUNCTION,
      LITERAL,
      TYPE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGleam(hljs);
}

export const gleam = { name: "gleam", register };
export default gleam;
