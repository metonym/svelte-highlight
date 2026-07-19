const TYPST_KEYWORDS =
  "let set show if else for while in as return break continue import include " +
  "from and or not none auto context";

const TYPST_LITERALS = "true false none auto";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineTypst(hljs) {
  const NUMBER = {
    className: "number",
    begin:
      /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?(?:%|pt|mm|cm|in|em|fr|deg|rad)?(?![\w%])/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const LINE_COMMENT = hljs.C_LINE_COMMENT_MODE;
  const BLOCK_COMMENT = hljs.C_BLOCK_COMMENT_MODE;

  const LABEL = {
    className: "symbol",
    begin: /<[a-zA-Z_][\w-]*>/,
  };

  const REFERENCE = {
    className: "symbol",
    begin: /@[a-zA-Z_][\w-]*/,
  };

  const FUNCTION_CALL = {
    className: "title.function",
    begin: /\b[a-zA-Z_][\w-]*(?=\()/,
    relevance: 0,
  };

  // Inline raw span: `code` (single backtick, no newlines)
  const RAW_INLINE = {
    className: "code",
    begin: /`/,
    end: /`/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // Fenced raw block: ```lang\n ... \n```
  const RAW_BLOCK = {
    className: "code",
    begin: /```/,
    end: /```/,
  };

  const MATH = {
    className: "string",
    begin: /\$/,
    end: /\$/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const HEADING = {
    className: "title",
    begin: /^[ \t]*={1,6}(?=[ \t]|$)/,
    end: /$/,
    excludeEnd: false,
    relevance: 10,
  };

  // `end` must not close on a delimiter preceded by whitespace (Typst only
  // treats "word*" as a valid close, not "word *"). Lookbehind isn't an
  // option, so the preceding character is required as part of the match
  // itself (previously `(?!\s)\*`, a no-op: the lookahead and the literal
  // both anchor to the same position, and `*` is never whitespace, so it
  // always passed regardless of what came before).
  const STRONG = {
    className: "strong",
    begin: /\*(?!\s)/,
    end: /[^\s*]\*/,
  };

  const EMPHASIS = {
    className: "emphasis",
    begin: /_(?!\s)/,
    end: /[^\s_]_/,
  };

  const LIST_MARKER = {
    className: "bullet",
    begin: /^[ \t]*(-|\+|\d+\.)(?=[ \t])/,
    relevance: 0,
  };

  const codeContains = () => [
    LINE_COMMENT,
    BLOCK_COMMENT,
    STRING,
    NUMBER,
    FUNCTION_CALL,
    PARENS,
    BRACES,
    BRACKETS,
  ];

  // Parenthesized argument/expression lists: (...)
  /** @type {import("highlight.js").Mode} */
  const PARENS = {
    begin: /\(/,
    end: /\)/,
    keywords: { keyword: TYPST_KEYWORDS, literal: TYPST_LITERALS },
    contains: [],
  };

  // Code block / dict / set body: {...}
  /** @type {import("highlight.js").Mode} */
  const BRACES = {
    begin: /\{/,
    end: /\}/,
    keywords: { keyword: TYPST_KEYWORDS, literal: TYPST_LITERALS },
    contains: [],
  };

  // Content block: [...] (markup nested inside code mode)
  /** @type {import("highlight.js").Mode} */
  const BRACKETS = {
    begin: /\[/,
    end: /\]/,
    keywords: { keyword: TYPST_KEYWORDS, literal: TYPST_LITERALS },
    contains: [],
  };

  PARENS.contains = /** @type {(import("highlight.js").Mode | "self")[]} */ ([
    "self",
    ...codeContains(),
  ]);
  BRACES.contains = /** @type {(import("highlight.js").Mode | "self")[]} */ ([
    "self",
    ...codeContains(),
  ]);
  BRACKETS.contains = /** @type {(import("highlight.js").Mode | "self")[]} */ ([
    "self",
    STRONG,
    EMPHASIS,
    ...codeContains(),
  ]);

  // Code mode: activated after `#`, covers keywords, function calls,
  // strings, numbers, comments, and nested blocks/parens/brackets. Ends
  // at a blank line, a markup-only boundary character, or end of input.
  // The lookahead also allows a bare `{`/`(`/`[` (not just an identifier),
  // since `#{ let x = 5 }`-style code blocks omit a leading keyword/call.
  const CODE_MODE = {
    begin: /#(?=[a-zA-Z_{([])/,
    end: /$|(?=[;,])/,
    returnEnd: true,
    relevance: 5,
    keywords: {
      keyword: TYPST_KEYWORDS,
      literal: TYPST_LITERALS,
    },
    contains: codeContains(),
  };

  return {
    name: "Typst",
    aliases: ["typst", "typ"],
    contains: [
      LINE_COMMENT,
      BLOCK_COMMENT,
      HEADING,
      LABEL,
      REFERENCE,
      RAW_BLOCK,
      RAW_INLINE,
      MATH,
      STRONG,
      EMPHASIS,
      LIST_MARKER,
      NUMBER,
      CODE_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineTypst(hljs);
}

export const typst = { name: "typst", register };
export default typst;
