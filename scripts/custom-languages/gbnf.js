/** @param {import("highlight.js").HLJSApi} hljs */
function defineGbnf(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const CHAR_CLASS = {
    className: "regexp",
    begin: /\[/,
    end: /\]/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const RULE_DEF = {
    begin: [/[A-Za-z_][\w-]*/, /\s*/, /::=/],
    beginScope: { 1: "title.function", 3: "operator" },
    relevance: 10,
  };

  const QUANTIFIER = {
    className: "operator",
    begin: /[*+?]|\{\d+(?:,\d*)?\}/,
    relevance: 0,
  };

  const ALTERNATION = {
    className: "operator",
    begin: /\|/,
    relevance: 0,
  };

  const RULE_REF = {
    className: "symbol",
    begin: /[A-Za-z_][\w-]*/,
    relevance: 0,
  };

  return {
    name: "GBNF",
    aliases: ["llama-grammar"],
    contains: [
      hljs.HASH_COMMENT_MODE,
      RULE_DEF,
      STRING,
      CHAR_CLASS,
      ALTERNATION,
      QUANTIFIER,
      RULE_REF,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineGbnf(hljs);
}

export const gbnf = { name: "gbnf", register };
export default gbnf;
