const CAIRO_KEYWORDS =
  "fn let mut const if else loop while for return match struct enum trait impl mod use pub extern type ref in of as self Self super crate break continue where dyn move box nopanic implicits";

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

  // Short strings (`'hello'`) are felt252 literals; Cairo has no char or
  // lifetime syntax, so a single-quoted run is always one of these.
  const SHORT_STRING = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // Inline macros from the corelib (`println!`, `format!`, `selector!`, the
  // `assert_*!` family) alongside the original `panic!`/`assert!`/`array!`.
  const MACRO = {
    className: "built_in",
    begin:
      /\b(?:panic|assert(?:_eq|_ne|_lt|_le|_gt|_ge)?|array|println|print|format|write|writeln|consteval_int|selector)!/,
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
      SHORT_STRING,
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
