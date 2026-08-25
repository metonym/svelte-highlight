const MOJO_KEYWORDS =
  "fn struct var let inout owned borrowed mut alias trait impl def if elif " +
  "else for while return from import as raise try except finally with yield " +
  "and or not in is pass continue break class";

const MOJO_TYPES =
  "Int Float64 String Bool SIMD UInt UInt8 UInt16 UInt32 UInt64 Int8 Int16 " +
  "Int32 Int64 Float16 Float32 DType Optional List Dict Tuple AnyType";

const MOJO_LITERALS = "True False None";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMojo(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfn\b/, /\s+/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  const STRUCT = {
    begin: [/\bstruct\b/, /\s+/, /[A-Za-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.class" },
  };

  const OWNERSHIP = {
    className: "keyword",
    begin: /\b(?:inout|owned|borrowed)\b/,
    relevance: 10,
  };

  return {
    name: "Mojo",
    aliases: ["mojo"],
    keywords: {
      keyword: MOJO_KEYWORDS,
      type: MOJO_TYPES,
      literal: MOJO_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      { className: "string", begin: /"""/, end: /"""/ },
      { className: "string", begin: /'''/, end: /'''/ },
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      OWNERSHIP,
      FUNCTION,
      STRUCT,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineMojo(hljs);
}

export const mojo = { name: "mojo", register };
export default mojo;
