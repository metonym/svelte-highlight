const ODIN_KEYWORDS =
  "package import foreign when if else for in switch case defer return proc struct enum union map bit_set bit_field distinct using cast transmute auto_cast or_else or_return or_break or_continue do break continue fallthrough dynamic matrix typeid context where not_in";

const ODIN_TYPES =
  "int i8 i16 i32 i64 i128 uint u8 u16 u32 u64 u128 uintptr f16 f32 f64 complex32 complex64 complex128 quaternion64 quaternion128 quaternion256 bool b8 b16 b32 b64 string cstring rune rawptr any byte typeid";

const ODIN_LITERALS = "true false nil";

// Compiler built-in procedures (the ones that need no import).
const ODIN_BUILT_INS =
  "len cap size_of align_of offset_of type_of type_info_of typeid_of " +
  "make new free delete append clear reserve resize copy min max abs clamp " +
  "assert panic unreachable swizzle complex quaternion real imag jmag kmag " +
  "conj expand_values soa_zip soa_unzip";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineOdin(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b0[oO][0-7][0-7_]*\b/ },
      { begin: /\b0[bB][01][01_]*\b/ },
      { begin: /\b0[zZ][0-9abAB][0-9abAB_]*\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?[ij]?\b/ },
    ],
    relevance: 0,
  };

  // `x: int = ---` leaves the variable uninitialized.
  const UNINITIALIZED = {
    className: "literal",
    begin: /---/,
    relevance: 0,
  };

  const DIRECTIVE = {
    className: "meta",
    begin: /#[a-zA-Z_]\w*/,
    relevance: 0,
  };

  // `@(private = "file")`, `@(export)`, or the bare `@static` form.
  const ATTRIBUTE = {
    className: "meta",
    variants: [{ begin: /@\(/, end: /\)/ }, { begin: /@[a-zA-Z_]\w*/ }],
    relevance: 0,
  };

  // `name :: proc(...)` (optionally `:: #force_inline proc`) is the
  // procedure declaration shape; the name is the title.
  const PROC_DECL = {
    begin: [
      /\b[a-zA-Z_]\w*/,
      /\s*::\s*/,
      /(?=(?:#force_(?:no_)?inline\s+)?proc\b)/,
    ],
    beginScope: { 1: "title.function" },
  };

  const TYPE = {
    className: "type",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  return {
    name: "Odin",
    aliases: ["odin", "odinlang"],
    keywords: {
      keyword: ODIN_KEYWORDS,
      type: ODIN_TYPES,
      literal: ODIN_LITERALS,
      built_in: ODIN_BUILT_INS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      { className: "string", begin: /`/, end: /`/ },
      {
        className: "string",
        begin: /'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      DIRECTIVE,
      ATTRIBUTE,
      PROC_DECL,
      TYPE,
      UNINITIALIZED,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineOdin(hljs);
}

export const odin = { name: "odin", register };
export default odin;
