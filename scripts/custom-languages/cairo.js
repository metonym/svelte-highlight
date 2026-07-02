const CAIRO_KEYWORDS =
  "fn let mut const if else loop while for return match struct enum trait impl mod use pub extern type ref in of as self Self break continue where dyn move box nopanic implicits";

const CAIRO_TYPES =
  "felt252 u8 u16 u32 u64 u128 u256 usize i8 i16 i32 i64 i128 bool Array Span Option Result ContractAddress ClassHash ByteArray";

const CAIRO_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCairo(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b0[oO][0-7][0-7_]*\b/ },
      { begin: /\b0[bB][01][01_]*\b/ },
      {
        begin:
          /\b\d[\d_]*(?:_(?:felt252|u8|u16|u32|u64|u128|u256|usize|i8|i16|i32|i64|i128))?\b/,
      },
    ],
    relevance: 0,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /#!?\[/,
    end: /\]/,
    relevance: 5,
  };

  const TYPE = {
    className: "type",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfn/, /\s+/, /[a-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  const MACRO = {
    className: "built_in",
    begin: /\b(?:panic|assert|array)!/,
    relevance: 0,
  };

  const SYSCALL = {
    className: "built_in",
    begin:
      /\b(?:get_caller_address|get_contract_address|get_block_timestamp)\b/,
    relevance: 0,
  };

  return {
    name: "Cairo",
    aliases: ["cairo"],
    keywords: {
      keyword: CAIRO_KEYWORDS,
      type: CAIRO_TYPES,
      literal: CAIRO_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      ATTRIBUTE,
      MACRO,
      SYSCALL,
      FUNCTION,
      TYPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCairo(hljs);
}

export const cairo = { name: "cairo", register };
export default cairo;
