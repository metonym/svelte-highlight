const C3_KEYWORDS = [
  "module",
  "import",
  "fn",
  "macro",
  "struct",
  "union",
  "enum",
  "fault",
  "def",
  "distinct",
  "bitstruct",
  "interface",
  "extern",
  "inline",
  "const",
  "var",
  "if",
  "else",
  "switch",
  "case",
  "default",
  "nextcase|5",
  "for",
  "foreach",
  "foreach_r",
  "while",
  "do",
  "defer",
  "return",
  "break",
  "continue",
  "try",
  "catch",
  "assert",
  "asm",
  "static",
  "tlocal",
  "public",
  "private",
  "alias",
  "typedef",
  "faultdef",
  "attrdef",
];

const C3_TYPES =
  "char ichar short ushort int uint long ulong int128 uint128 isz usz float double bool void String any typeid fault anyfault";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineC3(hljs) {
  const COMPTIME = {
    className: "meta",
    begin:
      /\$(?:if|else|switch|for|foreach|endif|endswitch|endfor|typeof|sizeof|assert|echo)\b/,
    relevance: 5,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin:
      /@(?:inline|extern|builtin|deprecated|if|public|private|local|packed|align|test)\b/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /\?\?|!|\?/,
    relevance: 0,
  };

  return {
    name: "C3",
    aliases: ["c3"],
    keywords: {
      keyword: C3_KEYWORDS,
      type: C3_TYPES,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      COMPTIME,
      ATTRIBUTE,
      OPERATOR,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineC3(hljs);
}

export const c3 = { name: "c3", register };
export default c3;
