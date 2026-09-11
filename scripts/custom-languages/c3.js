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

const C3_LITERALS = "true false null";

// Integer suffixes (`u`, `l`, `ul`, `i8`..`u128`) and float suffixes
// (`f`, `f16`..`f128`).
const C3_INT_SUFFIX = "(?:[iu](?:8|16|32|64|128)?|ul?|l)?";
const C3_FLOAT_SUFFIX = "(?:[iu](?:8|16|32|64|128)?|ul?|l|f(?:16|32|64|128)?)?";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineC3(hljs) {
  // C3 numbers take `_` separators and 0x/0o/0b prefixes; the fraction
  // requires a digit after the `.` so a range `1..2` stays two numbers.
  const NUMBER = {
    className: "number",
    variants: [
      {
        begin: new RegExp(
          String.raw`\b0[xX][0-9a-fA-F][0-9a-fA-F_]*${C3_INT_SUFFIX}\b`,
        ),
      },
      { begin: new RegExp(String.raw`\b0[oO][0-7][0-7_]*${C3_INT_SUFFIX}\b`) },
      { begin: new RegExp(String.raw`\b0[bB][01][01_]*${C3_INT_SUFFIX}\b`) },
      {
        begin: new RegExp(
          String.raw`\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?${C3_FLOAT_SUFFIX}\b`,
        ),
      },
    ],
    relevance: 0,
  };

  // `<* ... *>` doc comments (C3 0.6) carry contracts like `@require x > 0`.
  const DOC_COMMENT = hljs.COMMENT(/<\*/, /\*>/, {
    contains: [{ className: "doctag", begin: /@[a-z]\w*/ }],
  });

  const STRING = {
    className: "string",
    variants: [
      // `x"deadbeef"` hex bytes, `b64"..."` base64 bytes.
      { begin: /\b(?:x|b64)"/, end: /"/ },
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      // Character literals: `'a'`, and multi-character `'abcd'` integers.
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /`/, end: /`/ },
    ],
  };

  const COMPTIME = {
    className: "meta",
    begin:
      /\$(?:if|else|switch|case|default|for|foreach|endif|endswitch|endfor|endforeach|typeof|sizeof|alignof|offsetof|nameof|qnameof|extnameof|defined|assert|echo|error|eval|evaltype|stringify|concat|append|embed|include|exec|feature|is_const|assignable|vacount|vaarg|vaexpr|vatype|vaconst|vasplat)\b/,
    relevance: 5,
  };

  const ATTRIBUTE = {
    className: "meta",
    begin:
      /@(?:inline|noinline|extern|export|builtin|deprecated|if|public|private|local|packed|align|test|benchmark|noreturn|pure|operator|maydiscard|nodiscard|naked|weak|winapi|callconv|noinit|dynamic|init|finalizer|used|unused|section|link|overlap|format)\b/,
    relevance: 0,
  };

  const OPERATOR = {
    className: "operator",
    begin: /\?\?|!|\?/,
    relevance: 0,
  };

  // `fn <return type> name(` / `fn <return type> Type.method(`: the return
  // type is one token (`int`, `double?`, `Point*`, `List{int}`), then the
  // name, then the parameter list. A function-pointer type `fn void(int)`
  // has no name before its `(` and so does not match.
  const FUNCTION = {
    begin: [
      /\bfn\b/,
      /\s+/,
      /[^\s(]+/,
      /\s+/,
      /[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?/,
      /(?=\s*\()/,
    ],
    beginScope: { 1: "keyword", 3: "type", 5: "title.function" },
  };

  // `macro @swap(&a, &b)` / `macro long sum(long... args)`: the return type
  // is optional and the name may carry the `@` that marks a macro taking
  // references or trailing bodies.
  const MACRO = {
    variants: [
      {
        begin: [
          /\bmacro\b/,
          /\s+/,
          /[^\s(@]+/,
          /\s+/,
          /@?[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?/,
          /(?=\s*\()/,
        ],
        beginScope: { 1: "keyword", 3: "type", 5: "title.function" },
      },
      {
        begin: [
          /\bmacro\b/,
          /\s+/,
          /@?[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?/,
          /(?=\s*\()/,
        ],
        beginScope: { 1: "keyword", 3: "title.function" },
      },
    ],
  };

  return {
    name: "C3",
    aliases: ["c3"],
    keywords: {
      keyword: C3_KEYWORDS,
      type: C3_TYPES,
      literal: C3_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      DOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      COMPTIME,
      ATTRIBUTE,
      FUNCTION,
      MACRO,
      OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineC3(hljs);
}

export const c3 = { name: "c3", register };
export default c3;
