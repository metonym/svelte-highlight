const VYPER_KEYWORDS =
  "def return if elif else for in while pass break continue assert raise event struct interface enum flag implements import from as constant immutable public private external internal payable nonpayable view pure indexed log and or not range";

const VYPER_TYPES =
  "uint8 uint16 uint32 uint64 uint128 uint256 int8 int16 int32 int64 int128 int256 address bool bytes32 bytes Bytes String string decimal HashMap DynArray map";

const VYPER_LITERALS = "True False self msg block tx chain empty";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVyper(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const DECORATOR = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bdef/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  const NAMED_DECLARATION = {
    begin: [/\b(?:struct|interface|event)/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title class_" },
  };

  return {
    name: "Vyper",
    aliases: ["vyper"],
    keywords: {
      keyword: VYPER_KEYWORDS,
      type: VYPER_TYPES,
      literal: VYPER_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      { className: "string", begin: /"""/, end: /"""/ },
      {
        className: "string",
        begin: /b"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      {
        className: "string",
        begin: /b'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      DECORATOR,
      NAMED_DECLARATION,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineVyper(hljs);
}

export const vyper = { name: "vyper", register };
export default vyper;
