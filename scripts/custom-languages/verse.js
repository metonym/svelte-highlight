const VERSE_KEYWORDS = [
  "if",
  "then",
  "else",
  "for",
  "loop",
  "break",
  "return",
  "block",
  "spawn",
  "sync",
  "race",
  "rush",
  "branch",
  "defer",
  "case",
  "of",
  "not",
  "and",
  "or",
  "var",
  "set",
  "class",
  "struct",
  "interface",
  "enum",
  "module",
  "using",
  "import",
  "array",
  "map",
  "option",
  "tuple",
  "logic",
  "type",
  "where",
  "self",
  "Self",
  "super",
];

const VERSE_TYPES =
  "int float string void char agent player creative_device vector3 rotation";

const VERSE_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVerse(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const BLOCK_COMMENT = {
    className: "comment",
    begin: /<#/,
    end: /#>/,
  };

  const SPECIFIER = {
    className: "meta",
    begin:
      /<(?:decides|transacts|suspends|public|internal|override|native|computes|varies|constructor|unique|final|abstract)>/,
    relevance: 5,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /@[A-Za-z_]\w*/,
    relevance: 0,
  };

  const ASSIGN_OP = {
    className: "operator",
    begin: /:=/,
    relevance: 0,
  };

  const CLASS_NAME = {
    className: "title.class",
    begin: /\b[A-Z]\w*(?=\s*(?::=|<))/,
    relevance: 0,
  };

  return {
    name: "Verse",
    aliases: ["verse"],
    keywords: {
      keyword: VERSE_KEYWORDS,
      type: VERSE_TYPES,
      literal: VERSE_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      BLOCK_COMMENT,
      STRING,
      SPECIFIER,
      ATTRIBUTE,
      ASSIGN_OP,
      CLASS_NAME,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineVerse(hljs);
}

export const verse = { name: "verse", register };
export default verse;
