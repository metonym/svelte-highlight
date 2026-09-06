const UNISON_KEYWORDS = [
  "use",
  "type",
  "ability|5",
  "structural|5",
  "unique",
  "namespace",
  "where",
  "let",
  "do",
  "match",
  "with",
  "cases",
  "if",
  "then",
  "else",
  "handle",
  "forall",
  "termLink",
  "typeLink",
  "alias",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineUnison(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const CHAR = {
    className: "string",
    begin: /\?\\?./,
    relevance: 0,
  };

  const LINE_COMMENT = {
    className: "comment",
    begin: /--/,
    end: /$/,
  };

  const BLOCK_COMMENT = {
    className: "comment",
    begin: /\{-/,
    end: /-\}/,
  };

  const DOC_HASH = {
    className: "comment",
    begin: /##/,
    end: /$/,
  };

  const DOC_LITERAL = {
    className: "comment",
    begin: /\{\{/,
    end: /\}\}/,
  };

  const FORALL_SYMBOL = {
    className: "keyword",
    begin: /∀/,
    relevance: 0,
  };

  const TEST_MARKER = {
    className: "meta",
    begin: /\btest>/,
    relevance: 5,
  };

  const ANNOTATION = {
    className: "meta",
    begin: /@\[/,
    end: /\]/,
  };

  const ABILITY_SET = {
    className: "type",
    begin: /\{[A-Z]\w*(?:,\s*[A-Z]\w*)*\}/,
    relevance: 0,
  };

  const DELAY = {
    className: "operator",
    begin: /'/,
    relevance: 0,
  };

  const FORCE = {
    className: "operator",
    begin: /!/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /[+-]?\b(?:0x[0-9a-fA-F]+|0b[01]+|\d+(?:\.\d+)?)\b/,
    relevance: 0,
  };

  return {
    name: "Unison",
    aliases: ["unison"],
    keywords: {
      keyword: UNISON_KEYWORDS,
    },
    contains: [
      DOC_LITERAL,
      DOC_HASH,
      BLOCK_COMMENT,
      LINE_COMMENT,
      STRING,
      CHAR,
      FORALL_SYMBOL,
      TEST_MARKER,
      ANNOTATION,
      ABILITY_SET,
      DELAY,
      FORCE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineUnison(hljs);
}

export const unison = { name: "unison", register };
export default unison;
