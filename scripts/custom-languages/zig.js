const ZIG_KEYWORDS =
  "const var fn pub return if else while for switch break continue " +
  "defer errdefer try catch comptime inline noinline struct enum union " +
  "error test and or orelse unreachable async await suspend resume " +
  "nosuspend export extern packed align allowzero volatile linksection " +
  "threadlocal usingnamespace asm anytype noalias callconv opaque " +
  "anyframe";

const ZIG_LITERALS = "true false null undefined";

const ZIG_TYPES =
  "bool void type anyerror anytype anyopaque noreturn comptime_int comptime_float " +
  "isize usize c_char c_short c_ushort c_int c_uint c_long c_ulong " +
  "c_longlong c_ulonglong c_longdouble f16 f32 f64 f80 f128";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineZig(hljs) {
  const INT_TYPE = {
    className: "type",
    begin: /\b[iu]\d+\b/,
    relevance: 0,
  };

  const TYPE_MODIFIER = {
    className: "type",
    begin: /[?!](?=[A-Za-z_*])/,
    relevance: 0,
  };

  const NAMED_TYPE = {
    className: "type",
    begin: new RegExp(String.raw`\b(?:${ZIG_TYPES.split(" ").join("|")})\b`),
    relevance: 0,
  };

  const BUILTIN = {
    className: "built_in",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    variants: [
      {
        begin:
          /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*(?:\.[0-9a-fA-F_]+)?(?:[pP][+-]?\d+)?/,
      },
      { begin: /\b0[oO][0-7_]+/ },
      { begin: /\b0[bB][01_]+/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?/ },
    ],
    relevance: 0,
  };

  const MULTILINE_STRING = {
    className: "string",
    begin: /\\\\/,
    end: /$/,
    relevance: 0,
  };

  const CHAR = {
    className: "string",
    begin: /'/,
    end: /'/,
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0,
  };

  return {
    name: "Zig",
    aliases: ["zir"],
    keywords: {
      keyword: ZIG_KEYWORDS,
      literal: ZIG_LITERALS,
      type: ZIG_TYPES,
    },
    contains: [
      hljs.COMMENT(/\/\/[!/]/, /$/, { className: "doctag" }),
      hljs.C_LINE_COMMENT_MODE,
      MULTILINE_STRING,
      hljs.QUOTE_STRING_MODE,
      CHAR,
      BUILTIN,
      NUMBER,
      TYPE_MODIFIER,
      INT_TYPE,
      NAMED_TYPE,
      {
        // A single bounded match (keyword + whitespace + name) instead of
        // `beginKeywords`/`end`: the previous `end: /[(\s]/` matched the
        // space right after `fn` before the name was ever seen, and
        // `end: /\(/` alone risks scanning to the next `(` anywhere in the
        // document (e.g. never, on malformed/partial input) since `fn` is
        // always followed by whitespace then the name in real Zig code.
        begin: [/\bfn\b/, /\s+/, /[A-Za-z_]\w*/],
        beginScope: { 1: "keyword", 3: "title.function" },
      },
      { className: "title class_", begin: /\b[A-Z]\w*/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineZig(hljs);
}

export const zig = { name: "zig", register };
export default zig;
