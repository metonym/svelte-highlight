const WIT_KEYWORDS =
  "package world interface use import export func record variant enum " +
  "resource include type flags constructor static with as async";

// Primitive types, the built-in generics, and the `own`/`borrow` resource
// handles; `stream`/`future` are the component-model 0.3 async types.
const WIT_TYPES =
  "string u8 u16 u32 u64 s8 s16 s32 s64 f32 f64 bool char list option " +
  "result tuple own borrow stream future";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineWit(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+(?:\.\d+)+\b|\b\d+\b/,
    relevance: 0,
  };

  const VERSION = {
    className: "number",
    begin: /@\d+\.\d+\.\d+\b/,
    relevance: 10,
  };

  const PACKAGE_PATH = {
    className: "symbol",
    begin: /[a-z][\w-]*(?::[a-z][\w-]*)+(?:\/[a-z][\w-]*)*/,
    relevance: 10,
  };

  // Feature gates (`@since(version = 0.2.0)`, `@unstable(feature = x)`,
  // `@deprecated(version = 0.3.0)`) that precede an item.
  const GATE = {
    className: "meta",
    begin: /@(?:since|unstable|deprecated)\b/,
    relevance: 0,
  };

  const GENERIC = {
    begin: [
      /\b(?:list|option|result|tuple|own|borrow|stream|future)\b/,
      /\s*</,
    ],
    beginScope: { 1: "type" },
    end: />/,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      {
        className: "type",
        begin: /\b(?:string|u8|u16|u32|u64|s8|s16|s32|s64|f32|f64|bool|char)\b/,
      },
    ]),
    relevance: 5,
  };

  const DECLARATION = {
    begin: [
      /\b(?:world|interface|record|variant|enum|flags|resource|type)\b/,
      /\s+/,
      /[a-z][\w-]*/,
    ],
    beginScope: { 1: "keyword", 3: "title.class" },
    relevance: 10,
  };

  return {
    name: "WIT",
    aliases: ["wit"],
    keywords: {
      // Identifiers are kebab-case, so `from-list` or `not-found` must lex
      // as one word rather than leaking `list`/`not` as keywords; a `%`
      // prefix escapes a keyword used as an identifier (`%type: func()`).
      $pattern: "%?[a-z][\\w-]*",
      keyword: WIT_KEYWORDS,
      type: WIT_TYPES,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      GATE,
      VERSION,
      PACKAGE_PATH,
      GENERIC,
      DECLARATION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineWit(hljs);
}

export const wit = { name: "wit", register };
export default wit;
