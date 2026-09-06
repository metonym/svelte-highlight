const KOKA_KEYWORDS = [
  "module",
  "import",
  "pub",
  "fun",
  "fn",
  "val",
  "var",
  "type",
  "struct",
  "effect|5",
  "alias",
  "con",
  "ctl|5",
  "final",
  "raw",
  "handler",
  "handle",
  "with",
  "mask",
  "override",
  "named",
  "match",
  "if",
  "then",
  "elif",
  "else",
  "return",
  "in",
  "forall",
  "exists",
  "some",
  "abstract",
  "extern",
  "inline",
  "noinline",
  "linear",
  "rec",
  "co",
  "open",
  "extend",
  "behind",
  "infix",
  "infixl",
  "infixr",
  "as",
  "is",
];

const KOKA_LITERALS = "True False Nothing Just";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineKoka(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const CHAR = {
    className: "string",
    begin: /'(?:\\.|[^'\\])'/,
  };

  const EFFECT_TYPE = {
    className: "type",
    begin: /<[a-z][\w,\s]*>/,
    relevance: 0,
  };

  const OPTIONAL_PARAM = {
    className: "operator",
    begin: /\?/,
    relevance: 0,
  };

  return {
    name: "Koka",
    aliases: ["koka"],
    keywords: {
      keyword: KOKA_KEYWORDS,
      literal: KOKA_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      CHAR,
      EFFECT_TYPE,
      OPTIONAL_PARAM,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineKoka(hljs);
}

export const koka = { name: "koka", register };
export default koka;
