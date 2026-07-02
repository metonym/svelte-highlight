const V_KEYWORDS =
  "module import fn struct enum interface union pub mut const type if else for in match return go spawn defer unsafe or break continue assert as is sizeof typeof isreftype dump __global shared lock rlock select atomic static volatile asm goto none";

const V_TYPES =
  "int i8 i16 i32 i64 i128 u8 u16 u32 u64 u128 f32 f64 bool string rune byte char voidptr any isize usize map array thread";

const V_LITERALS = "true false none";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineV(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b0[oO][0-7][0-7_]*\b/ },
      { begin: /\b0[bB][01][01_]*\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    keywords: { keyword: V_KEYWORDS, literal: V_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /r"/,
        end: /"/,
      },
      {
        begin: /r'/,
        end: /'/,
      },
      {
        begin: /c?"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      {
        begin: /c?'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
      { begin: /`/, end: /`/ },
    ],
  };

  const ATTRIBUTE = {
    className: "meta",
    begin: /^\s*\[[a-zA-Z_]/,
    end: /\]/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfn/, /\s+/, /[a-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  const TYPE = {
    className: "type",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  const COMPTIME_KEYWORD = {
    className: "keyword",
    begin: /\$(?:if|else|for)\b/,
    relevance: 0,
  };

  const OPTION_TYPE = {
    className: "type",
    begin: /\?(?=[A-Za-z_])/,
    relevance: 0,
  };

  return {
    name: "V",
    aliases: ["v", "vlang"],
    keywords: {
      keyword: V_KEYWORDS,
      type: V_TYPES,
      literal: V_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      COMPTIME_KEYWORD,
      ATTRIBUTE,
      STRING,
      FUNCTION,
      TYPE,
      OPTION_TYPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineV(hljs);
}

export const v = { name: "v", register };
export default v;
