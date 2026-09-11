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

  // `@[heap; noinit]` is the attribute form since V 0.4.3; the bare
  // `[inline]` line form is the deprecated spelling it replaced.
  const ATTRIBUTE = {
    className: "meta",
    variants: [
      { begin: /@\[/, end: /\]/ },
      { begin: /^[ \t]*\[[a-zA-Z_]/, end: /\]/ },
    ],
    relevance: 0,
  };

  // C-interop directives: `#include <stdio.h>`, `#flag -lm`, `#pkgconfig`.
  const DIRECTIVE = {
    className: "meta",
    begin: /^[ \t]*#(?:include|flag|pkgconfig|preinclude|insert)\b/,
    end: /$/,
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

  // Methods: `fn (p &Point) scale(k int)`. The lookahead pins the shape
  // (receiver, then a name followed by its parameter or generic list), so an
  // anonymous function `fn (x int) int { ... }` does not match. The receiver
  // keeps its own type styling; the name after it is the title.
  const METHOD = {
    begin: [/\bfn/, /\s+/, /(?=\([^)]*\)\s+[a-z_]\w*\s*[([])/],
    beginScope: { 1: "keyword" },
    end: /\)/,
    keywords: { keyword: "mut shared", type: V_TYPES },
    contains: [TYPE],
    starts: {
      end: /(?=[([])/,
      contains: [{ className: "title.function", begin: /[a-z_]\w*/ }],
    },
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
      DIRECTIVE,
      STRING,
      METHOD,
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
