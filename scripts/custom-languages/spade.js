const SPADE_KEYWORDS =
  "entity fn pipeline decl inst let mut if else match mod use impl trait where struct enum pub";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSpade(hljs) {
  // `reg(clk)` binder -- unique to Spade among its VHDL/Rust neighbors.
  const REG_BINDER = {
    className: "keyword",
    begin: /\breg(?=\()/,
    relevance: 8,
  };

  // `reset(rst: 0)` clause on a reg binder.
  const RESET_CLAUSE = {
    className: "keyword",
    begin: /\breset(?=\()/,
    relevance: 5,
  };

  const TYPE_GENERIC = {
    className: "type",
    begin: /\b(?:uint|int|bool|clock)\b(?:<[^>]*>)?/,
    relevance: 0,
  };

  // Spade allows `_` digit separators, e.g. `100_000_000`.
  const NUMBER = {
    className: "number",
    begin: /\b\d[\d_]*\b/,
    relevance: 0,
  };

  const ARROW = {
    className: "punctuation",
    begin: /->/,
    relevance: 0,
  };

  return {
    name: "spade",
    keywords: {
      keyword: SPADE_KEYWORDS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      REG_BINDER,
      RESET_CLAUSE,
      TYPE_GENERIC,
      ARROW,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSpade(hljs);
}

export const spade = { name: "spade", register };
export default spade;
