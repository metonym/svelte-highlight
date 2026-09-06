const RAKU_KEYWORDS = [
  "use",
  "unit",
  "module",
  "class",
  "role",
  "grammar|5",
  "token|5",
  "rule",
  "regex",
  "sub",
  "method|5",
  "submethod",
  "multi|5",
  "proto",
  "only",
  "my",
  "our",
  "has",
  "state",
  "constant",
  "is",
  "does",
  "returns",
  "of",
  "where",
  "if",
  "elsif",
  "else",
  "unless",
  "with",
  "without",
  "for",
  "loop",
  "while",
  "until",
  "repeat",
  "given",
  "when",
  "default",
  "return",
  "last",
  "next",
  "redo",
  "gather",
  "take",
  "try",
  "CATCH",
  "CONTROL",
  "die",
  "fail",
  "start",
  "await",
  "react",
  "whenever",
  "supply",
  "emit",
  "say",
  "print",
  "put",
  "note",
  "so",
  "not",
  "and",
  "or",
  "xor",
  "andthen",
  "orelse",
  "eq",
  "ne",
  "lt",
  "gt",
  "le",
  "ge",
  "cmp",
  "leg",
  "eqv",
  "div",
  "mod",
  "x",
  "xx",
];

const RAKU_LITERALS =
  "True False Nil Any Mu Int Str Num Rat Bool Array Hash List Positional Associative Callable";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRaku(hljs) {
  const INTERPOLATION = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    contains: ["self"],
  };

  const VAR_INTERPOLATION = {
    className: "subst",
    begin: /\$[A-Za-z_][\w:]*/,
    relevance: 0,
  };

  const DOUBLE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION, VAR_INTERPOLATION],
  };

  const SINGLE_STRING = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const QQ_STRING = {
    className: "string",
    begin: /\bqq\{/,
    end: /\}/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION, VAR_INTERPOLATION],
  };

  const Q_STRING = {
    className: "string",
    begin: /\b[qQ]\{/,
    end: /\}/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const WORD_QUOTE = {
    className: "string",
    begin: /<(?=[\w!:./-])/,
    end: />/,
    relevance: 0,
  };

  const HEREDOC = hljs.END_SAME_AS_BEGIN({
    className: "string",
    begin: /q:to\/(\w+)\//,
    end: /^(\w+)$/,
  });

  const EMBEDDED_COMMENT = {
    className: "comment",
    begin: /#`\(/,
    end: /\)/,
  };

  const DECLARATOR_DOC = {
    className: "comment",
    begin: /#[|=]/,
    end: /$/,
  };

  const POD = hljs.COMMENT(/^=begin/, /^=end\b.*$/);

  const TWIGIL_VAR = {
    className: "variable",
    begin: /[$@%&][!.*^:?=][A-Za-z_]\w*/,
    relevance: 5,
  };

  const PLAIN_VAR = {
    className: "variable",
    begin: /[$@%&][A-Za-z_][\w:]*/,
    relevance: 0,
  };

  const REGEX_LITERAL = {
    className: "regexp",
    begin: /\b(?:rx|m|s)\//,
    end: /\//,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 5,
  };

  const NUMBER = {
    className: "number",
    begin:
      /\b(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][-+]?\d+)?)\b/,
    relevance: 0,
  };

  const HIGH_OPERATOR = {
    className: "operator",
    begin: /~~|<->/,
    relevance: 5,
  };

  const LOW_OPERATOR = {
    className: "operator",
    begin: /==>|<==|»|«|>>|<<|\.\.\.|…|\.\.|\^\.\.|\.\.\^|\/\/|\?\?|!!|=>|->|~/,
    relevance: 0,
  };

  return {
    name: "Raku",
    aliases: ["perl6", "rakumod", "raku"],
    keywords: {
      keyword: RAKU_KEYWORDS,
      literal: RAKU_LITERALS,
    },
    contains: [
      POD,
      EMBEDDED_COMMENT,
      DECLARATOR_DOC,
      hljs.HASH_COMMENT_MODE,
      HEREDOC,
      QQ_STRING,
      Q_STRING,
      DOUBLE_STRING,
      SINGLE_STRING,
      WORD_QUOTE,
      REGEX_LITERAL,
      TWIGIL_VAR,
      PLAIN_VAR,
      HIGH_OPERATOR,
      LOW_OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRaku(hljs);
}

export const raku = { name: "raku", register };
export default raku;
