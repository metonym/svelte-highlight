const BEND_KEYWORDS = [
  "def",
  "type",
  "object",
  "case",
  "match",
  "if",
  "else",
  "elif",
  "switch",
  "with",
  "bend|5",
  "fold|5",
  "when",
  "open",
  "use",
  "return",
  "lambda",
  "let",
  "do",
  "ask",
  "hvm",
  "import",
  "from",
  "as",
  "unchecked",
  "checked",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBend(hljs) {
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

  const BLOCK_COMMENT = {
    className: "comment",
    begin: /#\{/,
    end: /\}#/,
  };

  const TAG = {
    className: "symbol",
    begin: /#[A-Za-z_]\w*/,
    relevance: 0,
  };

  const RECURSIVE_FIELD = {
    className: "meta",
    begin: /~[A-Za-z_]\w*/,
    relevance: 0,
  };

  const LAMBDA_VAR = {
    className: "variable",
    begin: /λ[A-Za-z_]\w*|@[A-Za-z_]\w*/,
    relevance: 0,
  };

  const DUP = {
    className: "operator",
    begin: /!/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /[+-]?\b(?:0x[0-9a-fA-F]+|0b[01]+|\d+(?:\.\d+)?)\b/,
    relevance: 0,
  };

  const TYPE_NAME = {
    className: "title.class",
    begin: /\b[A-Z]\w*(?=[ {:(])/,
    relevance: 0,
  };

  return {
    name: "Bend",
    aliases: ["bend"],
    keywords: {
      keyword: BEND_KEYWORDS,
    },
    contains: [
      BLOCK_COMMENT,
      TAG,
      hljs.HASH_COMMENT_MODE,
      STRING,
      CHAR,
      RECURSIVE_FIELD,
      LAMBDA_VAR,
      DUP,
      TYPE_NAME,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBend(hljs);
}

export const bend = { name: "bend", register };
export default bend;
